import dotenv from 'dotenv';
dotenv.config();
import express, { json } from 'express';
import cors from 'cors';
import pkg from 'pg';

const { Pool } = pkg;

import courts from './courts';
app.use(courts())

app.get("/court", (req, res) => {
    res.send(courts);
})
const { DATABASE_URL } = process.env;

const app = express();
app.use(cors());
app.use(json());

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

import Stripe from 'stripe';
const stripe = new Stripe(import.meta.env.VITE_STRIPE_PRIVATE_KEY);

console.log(import.meta.env.VITE_STRIPE_PRIVATE_KEY);

// Endpoint to create a payment intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        // Calculate the total cost of the bookings
        const { bookings } = req.body; // Make sure to validate and authenticate the user's input
        const amount = bookings.reduce((sum, booking) => sum + booking.price, 0);

        // Create a payment intent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount is expected in cents (for USD)
            currency: 'usd', // Use the currency you want
            automatic_payment_methods: {
                enabled: true,
            },
            // You can add more options here if necessary
        });

        // Send the client secret to the client to use with Stripe Elements
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).send({ error: error.message });
    }
});


// POST endpoint to add a new user or update an existing user
app.post('/users', async (req, res) => {
    const { firebaseUid, name, email } = req.body;

    try {
        // Start a transaction
        await pool.query('BEGIN');

        // Check if the user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);

        let user;
        if (existingUser.rows.length === 0) {
            // User does not exist, create a new user record
            const newUser = await pool.query(
                'INSERT INTO users (firebase_uid, name, email, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
                [firebaseUid, name, email]
            );
            user = newUser.rows[0];
        } else {
            // User exists, optionally update the last login timestamp or other info
            // Update any other user information here as needed
            const updatedUser = await pool.query(
                'UPDATE users SET name = $2, email = $3 WHERE firebase_uid = $1 RETURNING *',
                [firebaseUid, name, email]
            );
            user = updatedUser.rows[0];
        }

        // Commit the transaction
        await pool.query('COMMIT');

        res.json(user);
    } catch (error) {
        // Rollback the transaction in case of an error
        await pool.query('ROLLBACK');
        console.error('Error in /users route:', error);
        res.status(500).json({ error: "Something went wrong, please try again later." });
    }
});

// get user profile
app.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error('Error retrieving user profile:', error);
        res.status(500).send('Failed to retrieve user profile');
    }
});

// update user profile
app.put('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { username, email, profile_picture_url } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2,  profile_picture_url = $3 WHERE user_id = $4 RETURNING *',
            [username, email, profile_picture_url, userId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Failed to update user profile');
    }
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

// add courts, not implemented in FE
app.post('/courts', async (req, res) => {
    const { name, location, description, price } = req.body;
    const client = await pool.connect();
    try {
        const newCourt = await client.query(
            'INSERT INTO courts (name, location, description, price, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
            [name, location, description, price]
        );
        res.json(newCourt.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong, please try again later!" });
    } finally {
        client.release();
    }
});

// get courts, implemented in FE
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
        client.release();

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


// update courts, not implemented in FE
app.put('/courts/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location, description, price } = req.body;
    const client = await pool.connect();
    try {
        const updatedCourt = await client.query(
            'UPDATE courts SET name = $1, location = $2, description = $3, price = $4 WHERE id = $4 RETURNING *',
            [name, location, description, price, id]
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

// delete courts, not implemented 
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

// add bookings
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

        console.log(userId);
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

// update booking
app.put('/bookings/:bookingId', async (req, res) => {
    const { bookingId } = req.params;
    const { firebaseUid, startTime, endTime } = req.body;

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

app.get('/courts/:courtId/images', async (req, res) => {
    const { courtId } = req.params;
    const client = await pool.connect();
    try {
        const query = 'SELECT * FROM images WHERE court_id = $1';
        const images = await client.query(query, [courtId]);
        res.json(images.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: "Failed to fetch images" });
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

// Adjust the app.listen to bind to the port and host as required by Render
const port = process.env.PORT || 3000; // Use the PORT environment variable provided by Render or default to 3000
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});