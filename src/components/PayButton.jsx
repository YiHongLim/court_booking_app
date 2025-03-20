import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const PayButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const bookings = useSelector((state) => state.bookings.bookingItems);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookings }),
      });
      
      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('There was an error processing your payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="primary" 
      onClick={handleCheckout}
      disabled={isLoading || bookings.length === 0}
    >
      {isLoading ? 'Processing...' : 'Proceed to Checkout'}
    </Button>
  );
};

export default PayButton;
