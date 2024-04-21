import StripeWrapper from './CheckoutForm'; // Assuming StripeWrapper is in the same directory

const PaymentPage = () => {
    return (
        <div className="payment-page">
            <h1>Make Your Payment</h1>
            <p>Please enter your payment details below:</p>
            <StripeWrapper />
        </div>
    );
};

export default PaymentPage;
