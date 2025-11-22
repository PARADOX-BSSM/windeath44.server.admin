import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminOverview from '../AdminOverview';

vi.mock('../../ui/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('../../ui/Sidebar', () => ({
  default: () => <div data-testid="sidebar" />,
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('../../config/observability', () => ({
  observabilityConfig: {
    grafanaUrl: 'https://example.com/grafana',
    argoCdUrl: 'https://example.com/argocd',
    kialiUrl: 'https://example.com/kiali',
    prometheusUrl: 'https://example.com/prometheus',
    kafkaUiUrl: 'https://example.com/kafka',
  },
}));

describe('AdminOverview', () => {
  it('renders quick actions linking to auth tools', () => {
    render(<AdminOverview activeNav="dashboard" />);

    const authToolsLink = screen.getByRole('link', { name: 'Open auth tools' });
    expect(authToolsLink).toHaveAttribute('href', '/admin/dashboard/auth/login');

    const manageAccessLink = screen.getByRole('link', { name: 'Manage access' });
    expect(manageAccessLink).toHaveAttribute('href', '/admin/dashboard/auth/login');
  });

  it('renders observability shortcuts with external link attributes', () => {
    render(<AdminOverview activeNav="dashboard" />);

    const grafanaLink = screen.getByRole('link', { name: 'Grafana' });
    expect(grafanaLink).toHaveAttribute('href', 'https://example.com/grafana');
    expect(grafanaLink).toHaveAttribute('target', '_blank');
    expect(grafanaLink).toHaveAttribute('rel', expect.stringContaining('noopener'));

    const argoLink = screen.getByRole('link', { name: 'Argo CD' });
    expect(argoLink).toHaveAttribute('href', 'https://example.com/argocd');
  });
});
