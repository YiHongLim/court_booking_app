import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

// Load your publishable key from the environment variable or configuration

const stripePromise = loadStripe(`${import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}`);

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded or there's some other error.
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            console.error('Error:', error);
        } else {
            // Send the paymentMethod.id to your server (e.g., via POST request)
            const response = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethodId: paymentMethod.id }),
            });
            const paymentIntentResponse = await response.json();

            // TODO: Handle the response from the server (e.g., payment confirmation or error)
            if (paymentIntentResponse.error) {
                // Payment failed: inform the user and try again
                setError(paymentIntentResponse.error);
            } else {
                // Payment succeeded: clear the error and proceed
                setError(null);
                // Update the UI or redirect the user
                alert('Payment successful!');
                // For example, redirect to a success page or reset the cart
                // window.location.href = '/success';
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardElement />
            <button type="submit" disabled={!stripe}>
                Pay
            </button>
            {error && <div className="error">{error}</div>}
        </form>
    );
};

const StripeWrapper = () => {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
};

export default StripeWrapper;
