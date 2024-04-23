import StripeWrapper from '../components/CheckoutForm'; // Assuming StripeWrapper is in the same directory
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure you've installed Bootstrap

const PaymentPage = () => {
    return (
        <div className="container mt-5">
            <div className="card shadow p-4 mb-4 bg-white">
                <div className="card-body">
                    <h1 className="card-title">Make Your Payment</h1>
                    <p className="card-text">Please enter your payment details below:</p>
                    <StripeWrapper />
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
