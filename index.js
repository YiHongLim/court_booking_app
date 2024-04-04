let express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { DATABASE_URL } = process.env;
require('dotenv').config();

let app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function getPostgresVersion() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT version()');
        console.log(res.rows[0]);
    } finally {
        client.release();
    }
}

getPostgresVersion();

app.post('/courts', async (req, res) => {
    const { name, location, description } = req.body;
    const client = await pool.connect();
    try {
        const newCourt = await client.query(
            'INSERT INTO courts (name, location, description, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
            [name, location, description]
        );
        res.json(newCourt.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong, please try again later!" });
    } finally {
        client.release();
    }
});

app.get('/courts', async (req, res) => {
    const client = await pool.connect();
    try {
        const courts = await client.query('SELECT * FROM courts');
        res.json(courts.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong, please try again later!" });
    } finally {
        client.release();
    }
});

// app.get('/courts/:id', async (req, res) => {
//   const { id } = req.params;
//   const client = await pool.connect();
//   try {
//     const court = await client.query('SELECT * FROM courts WHERE id = $1', [id]);
//     if (court.rows.length > 0) {
//       res.json(court.rows[0]);
//     } else {
//       res.status(404).json({ error: "Court not found" });
//     }
//   } catch (err) {
//     console.error(err.stack);
//     res.status(500).json({ error: "Something went wrong, please try again later!" });
//   } finally {
//     client.release();
//   }
// });

app.put('/courts/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location, description } = req.body;
    const client = await pool.connect();
    try {
        const updatedCourt = await client.query(
            'UPDATE courts SET name = $1, location = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, location, description, id]
        );
        if (updatedCourt.rows.length > 0) {
            res.json(updatedCourt.rows[0]);
        } else {
            res.status(404).json({ error: "Court not found" });
        }
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong, please try again later!" });
    } finally {
        client.release();
    }
});

app.delete('/courts/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const deletedCourt = await client.query('DELETE FROM courts WHERE id = $1 RETURNING *', [id]);
        if (deletedCourt.rows.length > 0) {
            res.json({ message: "Court deleted successfully" });
        } else {
            res.status(404).json({ error: "Court not found" });
        }
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong, please try again later!" });
    } finally {
        client.release();
    }
});

app.post('/bookings', async (req, res) => {
    const { courtId, firebaseUid, startTime, endTime } = req.body;

    try {
        // Resolve the Firebase UID to an internal user ID
        const userResult = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userResult.rows[0].id;

        // Insert the booking with the internal user ID
        const bookingResult = await pool.query(
            'INSERT INTO bookings (court_id, user_id, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [courtId, userId, startTime, endTime]
        );
        res.json(bookingResult.rows[0]);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).send('Failed to create booking');
    }
});


app.get('/users/:firebaseUid/bookings', async (req, res) => {
    const { firebaseUid } = req.params;

    try {
        // First, get the internal user ID from the Firebase UID
        const userRes = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userRes.rows[0].id;

        // Then, retrieve all bookings for that user ID
        const bookingsRes = await pool.query(`
      SELECT b.*, c.name as court_name, c.location as court_location
      FROM bookings b
      INNER JOIN courts c ON b.court_id = c.id
      WHERE b.user_id = $1
    `, [userId]);

        res.json(bookingsRes.rows);
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).send('Failed to retrieve bookings');
    }
});

// Utility function to get user ID from Firebase UID
const getUserIdFromFirebaseUid = async (firebaseUid) => {
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        if (userRes.rows.length === 0) {
            throw new Error('User not found');
        }
        return userRes.rows[0].id; // Returns the user ID
    } catch (error) {
        throw error; // You could handle the error differently depending on your needs
    }
};

// update booking
app.put('/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const { firebaseUid, startTime, endTime } = req.body;
    console.log(bookingId);
    try {
        const userRes = await pool.query('SELECT id FROM users WHERE firebase_uid = $1', [firebaseUid]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = userRes.rows[0].id;

        console.log(bookingId);
        console.log(userId)

        // Then proceed to check if the user has a booking with this ID
        const updateRes = await pool.query(
            'UPDATE bookings SET start_time = $1, end_time = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [startTime, endTime, bookingId, userId]
        );

        console.log(updateRes.userId)
        if (updateRes.rowCount === 0) {
            // No booking was updated, could mean it doesn't exist or the user isn't authorized to update it
            return res.status(404).json({ error: "Booking not found or not authorized" });
        }
    } catch (error) {
        console.error('Error updating booking:', error.message);
        res.status(500).send('Failed to update booking');
    }
});

// delete bookings by id
app.delete('/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    try {
        await pool.query(
            'DELETE FROM bookings WHERE id = $1',
            [bookingId]
        );
        res.send('Booking deleted successfully');
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).send('Failed to delete booking');
    }
});

// get images by court
app.get('/courts/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        const query = `
      SELECT c.*, array_agg(i.image_url) AS images
      FROM courts c
      LEFT JOIN images i ON c.id = i.court_id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
        const courtDetails = await client.query(query, [id]);
        client.release(); // It's good practice to release the client before sending the response

        if (courtDetails.rows.length > 0) {
            const court = courtDetails.rows[0];
            // Assuming images are returned as a PostgreSQL array string; parsing might not be needed if your setup automatically handles it
            court.images = court.images ? court.images : [];
            res.json(court);
        } else {
            res.status(404).json({ error: "Court not found" });
        }
    } catch (err) {
        console.error(err.stack);
        client.release(); // Ensure the client is released in case of errors too
        res.status(500).json({ error: "Something went wrong, please try again later!" });
    }
});


// Endpoint to add an image to a court
app.post('/courts/:courtId/images', async (req, res) => {
    const { courtId } = req.params;
    const { imageUrl } = req.body; // Assume the request body contains the URL of the image to add
    const client = await pool.connect();
    try {
        const newImage = await client.query(
            'INSERT INTO images (court_id, image_url) VALUES ($1, $2) RETURNING *',
            [courtId, imageUrl]
        );
        res.json(newImage.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Failed to add image" });
    } finally {
        client.release();
    }
});


// Assuming each image has a unique ID and you want to allow updating the image URL
app.put('/images/:imageId', async (req, res) => {
    const { imageId } = req.params;
    const { imageUrl } = req.body; // New image URL
    const client = await pool.connect();
    try {
        const updatedImage = await client.query(
            'UPDATE images SET image_url = $1 WHERE id = $2 RETURNING *',
            [imageUrl, imageId]
        );
        if (updatedImage.rows.length > 0) {
            res.json(updatedImage.rows[0]);
        } else {
            res.status(404).json({ error: "Image not found" });
        }
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Failed to update image" });
    } finally {
        client.release();
    }
});

// Endpoint to delete an image
app.delete('/images/:imageId', async (req, res) => {
    const { imageId } = req.params;
    const client = await pool.connect();
    try {
        const deletedImage = await client.query('DELETE FROM images WHERE id = $1 RETURNING *', [imageId]);
        if (deletedImage.rows.length > 0) {
            res.json({ message: "Image deleted successfully" });
        } else {
            res.status(404).json({ error: "Image not found" });
        }
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Failed to delete image" });
    } finally {
        client.release();
    }
});



app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to the twitter API!" });
});

app.listen(3000, () => {
    console.log('App is listening on port 3000');
})