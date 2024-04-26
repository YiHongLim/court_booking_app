import { useAuth } from "@/hooks/useAuth";
import axios from "axios";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";

const PayButton = () => {
    const bookings = useSelector((state) => state.bookings.bookingItems);
    const BASE_URL = import.meta.env.VITE_API_URL;
    const { currentUser } = useAuth();
    const userId = currentUser?.uid;

    const handleCheckout = async () => {
        // Create an array of line items for Stripe
        const lineItems = bookings.map(booking => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: booking.court_name,
                },
                unit_amount: booking.court_price * 100, // Convert to cents
            },
            quantity: 1, // Each booking is for one court
        }));

        try {
            console.log("Before reaching Stripe API", lineItems);
            const response = await axios.post(`${BASE_URL}/create-checkout-session`, {
                lineItems,  // Use the array created above
                userId: userId
            });

            console.log("After Stripe API");
            // Redirect to Stripe's hosted checkout page
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Error during the checkout process:', error.response ? error.response.data.error : error.message);
            // Handle errors here, such as displaying a notification to the user
        }
    };

    return (
        <Button onClick={handleCheckout} disabled={bookings.length === 0}>
            Proceed to Payment
        </Button>
    );
};

export default PayButton;
