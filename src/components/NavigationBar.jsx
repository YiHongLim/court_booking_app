import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import { getAuth } from 'firebase/auth';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const NavigationBar = ({ cartItemCount }) => {
    const auth = getAuth();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    // check if the currentUser is logged in
    // useEffect(() => {
    //     console.log(currentUser)
    //     if (!currentUser) {
    //         navigate("/login");
    //     }
    // }, [currentUser, navigate]);

    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    }


    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand onClick={() => navigate('/')}>Court Booking App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link onClick={() => navigate('/courts')}>Courts</Nav.Link>
                    </Nav>
                    <Button variant="outline-success" onClick={() => navigate('/booking')}>
                        Cart <Badge bg="secondary">{cartItemCount}</Badge>
                        <span className="visually-hidden">booking items</span>
                    </Button>
                    {currentUser && (
                        <Button variant="outline-danger" onClick={handleLogout} style={{ marginLeft: '10px' }}>
                            Logout
                        </Button>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
};

export default NavigationBar;
