import { render, screen } from '@testing-library/react';
import App from './App';

test('renders legal process fetcher header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Legal Process Fetcher/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders search form', () => {
  render(<App />);
  const searchButton = screen.getByText(/Search Processes/i);
  expect(searchButton).toBeInTheDocument();
});

test('renders CNPJ input field', () => {
  render(<App />);
  const cnpjInput = screen.getByLabelText(/CNPJ/i);
  expect(cnpjInput).toBeInTheDocument();
});
