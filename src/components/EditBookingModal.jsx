import { Modal, Button, Form } from 'react-bootstrap';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { TextField } from '@mui/material';
import { useState } from 'react';

const EditBookingModal = ({ show, onHide, booking, onUpdate }) => {
  const [startDate, setStartDate] = useState(new Date(booking.start_time));
  const [endDate, setEndDate] = useState(new Date(booking.end_time));

  const handleUpdateClick = () => {
    onUpdate(booking.id, startDate, endDate);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Booking</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form>
            <Form.Group>
              <DatePicker
                label="Start Date"
                inputFormat="MM/dd/yyyy"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </Form.Group>
            <Form.Group>
              <DatePicker
                label="End Date"
                inputFormat="MM/dd/yyyy"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </Form.Group>
          </Form>
        </LocalizationProvider>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleUpdateClick}>
          Update Booking
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditBookingModal;
