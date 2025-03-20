import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form, Card } from 'react-bootstrap';
import { storage } from '../firebase';

const CourtImageManager = ({ courtId, fetchImages }) => {
    const [file, setFile] = useState(null);
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchAndSetImages();
    }, [fetchImages]);

    const fetchAndSetImages = async () => {
        const imagesRef = ref(storage, `courts/${courtId}`);
        const snapshot = await listAll(imagesRef);
        // const imageUrls = await Promise.all(snapshot.items.map(item => getDownloadURL(item)));
        const imageData = await Promise.all(snapshot.items.map(async (item) => {
            return { 
                url: await getDownloadURL(item),
                fullPath: item.fullPath
            };
        }));
        setImages(imageData);
    };

    const uploadImage = async () => {
        if (!file) {
            alert('Please select a file first!');
            return;
        }
        const imageRef = ref(storage, `courts/${courtId}/${file.name}`);
        await uploadBytes(imageRef, file);
        fetchAndSetImages(); // Refresh images after upload
    };

    const deleteImage = async (fullPath) => {
        try {
            const refToDelete = ref(storage, fullPath);
            await deleteObject(refToDelete);
            console.log("Image successfully deleted");
            fetchAndSetImages(); // Refresh images after deletion
        } catch (error) {
            console.error("Error deleting image: ", error);
        }
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <Form>
                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Upload a new court image:</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Form.Group>
                        <Button onClick={uploadImage}>Upload Image</Button>
                    </Form>
                </Col>
            </Row>
            <Row>
                {images.map((image, index) => (
                    <Col key={index} xs={12} md={4} lg={3}>
                        <Card className="mb-3">
                            <Card.Img variant="top" src={image.url} />
                            <Card.Body>
                                <Button variant="danger" onClick={() => deleteImage(image.fullPath)}>Delete Image</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default CourtImageManager;
