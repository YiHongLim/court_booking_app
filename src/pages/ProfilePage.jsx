// =========================================
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';

import { getUserInfo, updateUserInfo } from '../features/users/activeUserSlice';
import { setUserInLocalStorage, getUserFromLocalStorage } from '../utils/storage';

import defaultProfileImage from '../assets/images/user-profile-default.webp';
// =========================================
export default function ProfilePage() {
    // ================
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // ============
    const userId = useParams().id;

    // Debug
    //console.log("[Profile Page] User ID", userId);
    // ============
    const activeUser = useSelector((state) => state.activeUser);

    const [name, setName] = useState(activeUser.user ? activeUser.user.name : "");
    const [email, setEmail] = useState(activeUser.user ? activeUser.user.email : "");
    const [image, setImage] = useState(activeUser.user ? activeUser.user.profile_picture_url : "");
    const [isCorrectImageFormat, setIsCorrectImageFormat] = useState(true);

    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const updateProfileImage = (event) => {
        const file = event.target.files[0];

        if (!file) {
            setImage(null);
            return;
        }

        loadProfileImage(file);
    };

    const loadProfileImage = (file) => {
        // Debug
        //console.log("[On Profile Picture Upload] Size.", file.size);

        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.addEventListener("load", () => {
            const url = fileReader.result;

            // Test for width and height
            const testImg = new window.Image();
            testImg.onload = () => {
                // Debug
                //console.log("[On Profile Picture Upload] Width: " + width + ", Height: " + height);

                const isValid = file.size <= 128000;
                setIsCorrectImageFormat(isValid);

                if (isValid)
                    setImage(url);
            }
            testImg.src = url;
        });
    };
    // ============
    useEffect(() => {
        // ===================================================
        // 1. Present to users cached data first while we wait for updated data from server.
        // If failed to acquire user from memory cache (Redux), acquire from local storage.
        // Debug
        console.log("[On Profile Page Startup] Memory Cached User.", activeUser);

        if (!activeUser || (activeUser && !activeUser.user)) {
            const localStorageUser = getUserFromLocalStorage();

            // Debug
            console.log("[On Profile Page Startup] Load from Cache", localStorageUser);

            setName(localStorageUser.name);
            setEmail(localStorageUser.email);
            setImage(localStorageUser.profile_picture_url);
        }
        // ===================================================
        // 2. In the meantimewe grab from server and update to latest information when completed.
        dispatch(getUserInfo(userId))
            .unwrap()
            .then(
                (user) => {
                    const serverLoadedUser = {
                        id: userId,
                        email: user.email,
                        name: user.name,
                        profile_picture_url: user.profile_picture_url
                    };

                    // Debug
                    console.log("[Get User Info Successful] Server Loaded User.", user);

                    setName(user.name);
                    setEmail(user.email);
                    setImage(user.profile_picture_url);

                    setUserInLocalStorage(serverLoadedUser);
                }
            )
            .catch((error) => {
                // Debug
                //console.log("[Get User Info Failed] Error.", error ? error : "N/A");
            });
        // ===================================================
    }, [dispatch, userId]); // We only want to run checks for at the beginning when the page is rendered.
    // ============
    useEffect(() => {
        if (image)
            return;
        const profilePictureFileElement = document.getElementById('profile-picture');

        // Debug
        //console.log("[On Profile Page Startup] File.", profilePictureFileElement.files);

        if (profilePictureFileElement.files.length > 0)
            loadProfileImage(profilePictureFileElement.files[0]);
    });
    // ============
    const onUpdateUserProfile = (event) => {
        event.preventDefault();

        setMessage("");
        setIsError(false);

        // Debug
        //console.log("[Update User Profile] Image Format Flag.", isCorrectImageFormat);

        if (!isCorrectImageFormat)
            return;

        const userObj = { user_id: userId, name: name, email: email, profile_picture_url: image };

        // Debug
        console.log("[Update User Profile] New User Data.", userObj);

        dispatch(updateUserInfo(userObj))
            .unwrap()
            .then((userData) => {
                // Debug
                //console.log("[On Update User Profile Successful] Payload.", action.payload);

                setUserInLocalStorage({
                    id: userId,
                    email: userData.email,
                    name: userData.name,
                    profile_picture_url: userData.profile_picture_url
                });

                setMessage("User Profile updated successfully.");
            })
            .catch((error) => {
                // Debug
                //console.log("[On Update User Profile Failed] Payload.", error);

                setMessage("Something went wrong with the profile update process.");
                setIsError(true);
            });
    };

    const onReturnToHomePage = () => {
        navigate("/");
    };
    // ================
    return (
        <>
            <Container fluid style={{ flex: 1 }}>
                <Form onSubmit={onUpdateUserProfile}>
                    <Row className="d-flex flex-column align-items-center mb-3">
                        <Col className="col-12 d-flex flex-column align-items-center col-12 mt-3 mb-3 w-50">
                            <p className="fs-1 fw-bold text-center">
                                Profile Page
                            </p>
                        </Col>
                        <Col className="col-12 d-flex flex-column align-items-center col-12 mb-3 ms-5 w-50" style={{ minWidth: "450px" }}>
                            {/* -------------------------------------- */}
                            {/* Email */}
                            <div className="d-flex mt-3 w-100">
                                <Form.Label htmlFor="name" className="me-3" style={{ width: "15%", minWidth: "60px" }}>
                                    Email:
                                </Form.Label>
                                <Form.Control id="email"
                                    value={email}
                                    placeholder={"Your Account Email"}
                                    maxLength={64}
                                    type="email"
                                    className="w-100"
                                    onChange={(event) => setEmail(event.target.value)}
                                    style={{ resize: "none", height: "fit-content", minWidth: "300px" }}
                                    required
                                />
                            </div>
                            {/* -------------------------------------- */}
                            {/* User Name */}
                            <div className="d-flex mb-2 mt-3 w-100">
                                <Form.Label htmlFor="name" className="me-3" style={{ width: "15%", minWidth: "60px" }}>
                                    Name:
                                </Form.Label>
                                <Form.Control id="name"
                                    value={name}
                                    maxLength={64}
                                    placeholder={"Your Account Name"}
                                    type="text"
                                    className="w-100"
                                    onChange={(event) => setName(event.target.value)}
                                    style={{ resize: "none", height: "fit-content", minWidth: "300px" }}
                                    required
                                />
                            </div>
                            {/* -------------------------------------- */}
                            {/* Profile Picture (Image) */}
                            <div className="d-flex mb-2 w-100">
                                <Form.Label htmlFor="profile-picture" className="me-3" style={{ width: "15%", minWidth: "60px" }}>
                                    Profile Picture:<span> </span>
                                </Form.Label>
                                <Form.Control id="profile-picture"
                                    className={`${isCorrectImageFormat ? "text-secondary" : "text-danger fw-bold"} mb-2 w-100`}
                                    style={{ resize: "none", height: "fit-content", minWidth: "300px" }}
                                    type="file" accept="image/png, image/jpg, image/jpeg, image/webp, image/svg"
                                    onChange={updateProfileImage} />
                            </div>

                            {/* Image Preview */}
                            {
                                image ? (
                                    <div className="d-flex align-items-center mb-3">
                                        <Image src={image ? image : defaultProfileImage} className="me-3"
                                            style={{ minWidth: "96px", minHeight: "96px", maxWidth: "128px", maxHeight: "128px", width: "100%", height: "auto" }} />
                                        <Image src={image ? image : defaultProfileImage} className="me-3"
                                            style={{ minWidth: "64px", minHeight: "64px", maxWidth: "96px", maxHeight: "96px", width: "100%", height: "auto" }} />
                                        <Image src={image ? image : defaultProfileImage}
                                            style={{ minWidth: "32px", minHeight: "32x", maxWidth: "64px", maxHeight: "64px", width: "100%", height: "auto" }} />
                                    </div>
                                ) : null
                            }

                            {/* Image Format */}
                            {
                                (!isCorrectImageFormat) ?
                                    (
                                        <Form.Label className="text-danger">
                                            The current profile picture does not meet the requirements.
                                        </Form.Label>
                                    ) :
                                    null
                            }

                            {/* Image Conditions */}
                            <div className="d-flex flex-column rounded mb-4 px-2">
                                <Form.Text className="text-non-links-primary login-text fw-bold">Requirements for profile picture setup: </Form.Text>
                                <Form.Text className="text-non-links-primary login-text">1. Must not exceed 128kb. </Form.Text>
                            </div>
                            {/* -------------------------------------- */}
                            <div className="d-flex justify-content-center w-100">
                                <Button type="submit" style={{ marginRight: "10%" }}>
                                    Update Profile
                                </Button>
                                <Button onClick={onReturnToHomePage}>
                                    Return to Home Page
                                </Button>
                            </div>
                            {/* -------------------------------------- */}
                            {
                                message ? (
                                    <div className="d-flex justify-content-center w-100 mt-3">
                                        <p className={`${isError ? "text-danger" : "text-success"} text-center y-0 py-0`}>
                                            {message}
                                        </p>
                                    </div>
                                ) : null
                            }
                            {/* -------------------------------------- */}
                        </Col>
                    </Row>
                </Form>
            </Container>
        </>
    );
}
// =========================================