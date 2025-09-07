import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Alert from '../../components/Alert';

afterEach(() => {
    cleanup();
});

describe('Alert', () => {
    it('renders nothing when alert prop is falsy', () => {
        const { container } = render(<Alert alert={null} onClose={() => {}} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders alert with message and classes', () => {
        const alert = { type: 'success', message: 'Saved successfully' };
        render(<Alert alert={alert} onClose={() => {}} />);

        const alertEl = screen.getByRole('alert');
        expect(alertEl).toHaveTextContent('Saved successfully');
        expect(alertEl).toHaveClass('alert', 'alert-success', 'alert-dismissible', 'fade', 'show', 'mt-3');
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        const alert = { type: 'danger', message: 'Something went wrong' };
        render(<Alert alert={alert} onClose={onClose} />);

        const closeBtn = screen.getByRole('button');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});