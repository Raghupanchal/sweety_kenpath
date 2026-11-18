import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReadingModal from '../components/ReadingModal';
import api from '../services/api';

vi.mock('../services/api');

describe('ReadingModal Form Validations (React Testing Library)', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders reading form fields when open', () => {
    render(
      <ReadingModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Log Blood Glucose/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Measurement Slot/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. 110/i)).toBeInTheDocument();
  });

  it('shows error "Please enter a glucose value." when value is empty', async () => {
    render(
      <ReadingModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Save (Glucose )?Reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Please enter a glucose value.')).toBeInTheDocument();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows error "Value must be between 40 and 600 mg/dl." when value is out of range', async () => {
    render(
      <ReadingModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const valueInput = screen.getByPlaceholderText(/e.g. 110/i);
    fireEvent.change(valueInput, { target: { value: '30' } });

    const submitBtn = screen.getByRole('button', { name: /Save (Glucose )?Reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    });

    // Test upper bound
    fireEvent.change(valueInput, { target: { value: '650' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('shows error "Date cannot be in the future." when future date is chosen', async () => {
    render(
      <ReadingModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const dateInput = screen.getByLabelText(/Date/i);
    // 2099-01-01 is definitely in the future
    fireEvent.change(dateInput, { target: { value: '2099-01-01' } });

    const valueInput = screen.getByPlaceholderText(/e.g. 110/i);
    fireEvent.change(valueInput, { target: { value: '115' } });

    const submitBtn = screen.getByRole('button', { name: /Save (Glucose )?Reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Date cannot be in the future.')).toBeInTheDocument();
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('submits valid reading and invokes onSuccess callback', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        message: 'Reading added successfully.',
        data: { id: 'uuid-1', reading_date: '2026-10-15', slot: 'Morning (fasting)', value: 95 },
      },
    });

    render(
      <ReadingModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const valueInput = screen.getByPlaceholderText(/e.g. 110/i);
    fireEvent.change(valueInput, { target: { value: '95' } });

    const submitBtn = screen.getByRole('button', { name: /Save (Glucose )?Reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
