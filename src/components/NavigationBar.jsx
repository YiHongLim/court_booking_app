import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';

const NavigationBar = ({ cartItemCount }) => {
    const navigate = useNavigate();

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand onClick={() => navigate('/')}>Court Booking App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link onClick={() => navigate('/courts')}>Courts</Nav.Link>
                        <Nav.Link onClick={() => navigate('/booking')}>Booking</Nav.Link>
                    </Nav>
                    <Button variant="outline-success" onClick={() => navigate('/booking')}>
                        Cart <Badge bg="secondary">{cartItemCount}</Badge>
                        <span className="visually-hidden">booking items</span>
                    </Button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
