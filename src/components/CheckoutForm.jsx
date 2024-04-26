// import React from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// // Load the Stripe script with your publishable key
// const stripePromise = loadStripe('your_stripe_public_key');

// const CheckoutForm = ({ amount }) => {
//     const stripe = useStripe();
//     const elements = useElements();

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         if (!stripe || !elements) {
//             // Stripe.js has not loaded yet. Make sure to disable form submission until Stripe.js has loaded.
//             return;
//         }

//         // Call your backend to create the Checkout session
//         const { sessionId } = await fetch('/create-checkout-session', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ amount }),
//         }).then(res => res.json());

//         // When the customer clicks on the button, redirect them to Checkout
//         const result = await stripe.redirectToCheckout({
//             sessionId,
//         });

//         if (result.error) {
//             // If `redirectToCheckout` fails due to a browser or network error, display the localized error message to your customer.
//             alert(result.error.message);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <CardElement />
//             <button type="submit" disabled={!stripe}>
//                 Pay {amount}
//             </button>
//         </form>
//     );
// };

// const PaymentButton = ({ amount }) => {
//     return (
//         <Elements stripe={stripePromise}>
//             <CheckoutForm amount={amount} />
//         </Elements>
//     );
// };

// export default PaymentButton;
