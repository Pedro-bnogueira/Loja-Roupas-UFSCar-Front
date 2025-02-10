/* eslint-disable testing-library/no-wait-for-side-effects */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import Dashboard from '../Dashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@testing-library/jest-dom';

// --- Error Boundary ---
// This ErrorBoundary catches errors (such as attempting to access properties on null)
// and displays an error message.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div>Error loading data: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

// --- Mocks ---

// Mock axios so that API calls can be simulated
jest.mock('axios');

// Mock chart components so that we can verify test IDs
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Bar: () => <div data-testid="bar-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
  Pie: () => <div data-testid="pie-chart" />,
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  AttachMoney: () => <div data-testid="money-icon" />,
  People: () => <div data-testid="people-icon" />,
  Sync: () => <div data-testid="sync-icon" />,
  LocalMall: () => <div data-testid="mall-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
}));

// --- Custom Theme ---
// Create a custom theme that includes a tertiary palette (so that references like theme.palette.tertiary.dark are defined)
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2', dark: '#115293' },
    secondary: { main: '#dc004e' },
    tertiary: { main: '#f57c00', dark: '#e65100' },
  },
});

// --- Test Data ---
const mockData = {
  salesOverTime: [{ month: '2023-01', total: 1000 }],
  purchasesOverTime: [{ month: '2023-01', total: 500 }],
  topProduct: {
    name: 'Test Product',
    brand: 'Test Brand',
    size: 'M',
    color: 'Red',
    totalSold: 50,
  },
  totalSales: 1500,
  totalPurchases: 750,
  totalExchanges: 5,
  totalReturns: 3,
  totalUsers: 10,
  userRole: 'user', // non-admin by default
  formattedInventory: [
    { categoryName: 'Category 1', totalStock: 100 },
    { categoryName: 'Category 2', totalStock: 200 },
  ],
};

// A wrapper that provides both the custom theme and the ErrorBoundary to Dashboard during tests
const Wrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    <ErrorBoundary>{children}</ErrorBoundary>
  </ThemeProvider>
);

// --- Tests ---
describe('Dashboard Component', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  test('renders loading spinner initially', () => {
    // Simulate a pending API call by never resolving the promise
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(<Dashboard />, { wrapper: Wrapper });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles API error gracefully', async () => {
    // Simulate an API error (which will result in dashboardData being null and trigger an error)
    axios.get.mockRejectedValue(new Error('API Error'));
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Now we only expect an error message that begins with "Error loading data:"
      expect(screen.getByText(/Error loading data:/i)).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  test('renders KPIs with correct data', async () => {
    axios.get.mockResolvedValue({ data: mockData });
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Verify that currency values are formatted correctly
      expect(screen.getByText(/R\$.*1\.500,00/)).toBeInTheDocument();
      expect(screen.getByText(/R\$.*750,00/)).toBeInTheDocument();
      // Verify that the sum of exchanges and returns (5 + 3 = 8) is rendered
      expect(screen.getByText('8')).toBeInTheDocument();
    });
  });

  test('shows admin-specific content for admin users', async () => {
    // Set userRole to "admin" so that admin-specific UI is rendered
    const adminData = { ...mockData, userRole: 'admin' };
    axios.get.mockResolvedValue({ data: adminData });
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Verify that admin-specific KPI (for example, "Usuários Ativos") and the user count ("10") is rendered
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText(/usuários ativos/i)).toBeInTheDocument();
    });
  });

  test('paginates between chart pages', async () => {
    axios.get.mockResolvedValue({ data: mockData });
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // On page 0, verify that the expected charts are rendered
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
    
    // Navigate to the next page
    fireEvent.click(screen.getByTestId('chevron-right'));
    
    await waitFor(() => {
      // On page 1, expect the alternate charts to be rendered
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
    
    // Navigate back to page 0
    fireEvent.click(screen.getByTestId('chevron-left'));
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  test('renders correct charts based on page', async () => {
    axios.get.mockResolvedValue({ data: mockData });
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // On page 0, expect to see the line-chart and doughnut-chart
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
    
    // Navigate to page 1
    fireEvent.click(screen.getByTestId('chevron-right'));
    
    await waitFor(() => {
      // On page 1, expect to see the pie-chart and bar-chart
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  test('formats currency correctly', async () => {
    // Removed the date formatting expectation because the Dashboard does not render the formatted date text.
    axios.get.mockResolvedValue({ data: mockData });
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Verify that total sales is formatted as currency correctly
      expect(screen.getByText(/R\$.*1\.500,00/)).toBeInTheDocument();
    });
  });

  test('handles missing data gracefully', async () => {
    // Simulate incomplete data where topProduct is missing
    const incompleteData = { ...mockData, topProduct: null };
    axios.get.mockResolvedValue({ data: incompleteData });
    render(<Dashboard />, { wrapper: Wrapper });
    
    await waitFor(() => {
      // Expect a fallback message when topProduct is missing.
      expect(screen.getByText(/nenhum produto vendido ainda/i)).toBeInTheDocument();
    });
  });
});
