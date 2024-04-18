// CourtImageManager.js
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form, Card } from 'react-bootstrap';
import { storage } from '../firebase';

const CourtImageManager = ({ courtId, fetchImages }) => {
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const uploadImage = async () => {
        if (!file) {
            alert('Please select a file first!');
            return;
        }
        const imageRef = ref(storage, `courts/${courtId}/${file.name}`);
        await uploadBytes(imageRef, file);
        fetchImages(); // Refresh images after upload
    };

    const deleteImage = async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        fetchImages(); // Refresh images after deletion
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
        </Container>
    );
};

export default CourtImageManager;
