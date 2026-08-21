import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from './App';
import { AppThemeProvider } from './ThemeProvider';

describe('App', () => {
  it('renders the app title within the themed shell', () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    expect(screen.getByRole('heading', { name: /cfengine policy builder/i })).toBeInTheDocument();
  });
});
