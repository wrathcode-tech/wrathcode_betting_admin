import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Crownbet/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
});
