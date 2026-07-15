import type { ReactNode } from 'react';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import { dark, light } from '@northern.tech/themes/CFEngine';

import { useColorScheme } from './hooks/useColorScheme';

const themes = {
  light: createTheme(light),
  dark: createTheme(dark)
};

/**
 * Applies the CFEngine MUI theme (from the shared @northern.tech/themes
 * package), following the OS light/dark preference.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  return (
    <ThemeProvider theme={themes[scheme]}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
