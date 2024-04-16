import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form, Card } from 'react-bootstrap';
import { storage } from '../firebase';

const CourtImageManager = ({ courtId }) => {
    const [file, setFile] = useState(null);
    const [images, setImages] = useState([]); // This would be fetched from the database

    useEffect(() => {
        fetchImages();
    }, []);

    const uploadImage = async () => {
        if (!file) {
            alert('Please select a file first!');
            return;

        }
        const imageRef = ref(storage, `courts/${courtId}/${file.name}`);
        const snapshot = await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);
        setImages([...images, imageUrl]);
    };

    const fetchImages = () => {
        const imagesRef = ref(storage, `courts/${courtId}`);
        listAll(imagesRef)
            .then(async (response) => {
                const urls = await Promise.all(response.items.map((item) => getDownloadURL(item)));
                setImages(urls);
            })
            .catch((error) => console.log(error));
    };


    const deleteImage = async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        setImages(images.filter((url) => url !== imageUrl));
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
                {images.map((imageUrl, idx) => (
                    <Col key={idx} md={4} className="mb-3">
                        <Card>
                            <Card.Img variant="top" src={imageUrl} />
                            <Card.Body>
                                <Button variant="danger" onClick={() => deleteImage(imageUrl)}>
                                    Delete
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default CourtImageManager;
