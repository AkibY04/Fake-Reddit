import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

test('Create Post button is disabled for guest users', () => {
    render(<App />);
    
    const createPostButton = screen.getByRole('create-post-button', { name: /Create Post/i });
    
    expect(createPostButton).toBeDisabled();
});

test('Create Post button is enabled for registered users', () => {
    render(<App />);
    
    fireEvent.change(screen.getByTestId('currAccountStatus'), { target: { value: 'user' } });

    const createPostButton = screen.getByRole('create-post-button', { name: /Create Post/i });
    
    expect(createPostButton).toBeEnabled();
});
