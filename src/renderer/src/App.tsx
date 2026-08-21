import { Box, Container, Stack, Typography } from '@mui/material';

import PolicyFormatter from './components/PolicyFormatter';

/**
 * Placeholder landing screen. Its job right now is to prove the Mission Portal
 * theme is wired end-to-end (typography, palette, component overrides) and that
 * the Python sidecar is reachable.
 */
export default function App() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
            CFEngine Policy Builder
          </Typography>
          <Typography color="text.muted">Build valid CFEngine policy visually — Electron + React shell with the Mission Portal theme.</Typography>
        </Box>
        <PolicyFormatter />
      </Stack>
    </Container>
  );
}
