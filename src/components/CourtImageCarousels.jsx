import Carousel from 'react-bootstrap/Carousel';

export const CourtImageCarousel = ({ images }) => {
  return (
    <Carousel>
      {images.map((image, idx) => (
        <Carousel.Item key={idx}>
          <img
            className="d-block w-100"
            src={image.url}
            alt={`Slide ${idx + 1}`}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};
