import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../Sidebar';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it('renders expanded by default with navigation labels visible', () => {
    render(<Sidebar activeItem="dashboard" />);

    expect(screen.getByText('Navigation')).toBeVisible();
    expect(screen.getByText('Dashboard')).toBeVisible();
  });

  it('collapses and expands when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar activeItem="dashboard" />);

    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    await user.click(toggleButton);

    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: /expand sidebar/i });
    await user.click(expandButton);

    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeVisible();
  });

  it('opens external links in a new window', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<Sidebar activeItem="dashboard" />);

    const grafanaButton = screen.getByRole('button', { name: /grafana/i });
    await user.click(grafanaButton);

    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('grafana'), '_blank', 'noopener,noreferrer');

    openSpy.mockRestore();
  });

  it('pushes internal routes with next/router', async () => {
    const user = userEvent.setup();
    render(<Sidebar activeItem="grafana" />);

    const dashboardButton = screen.getByRole('button', { name: /^dashboard$/i });
    await user.click(dashboardButton);

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
