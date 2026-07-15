import { Box, Container, Stack, Typography } from '@mui/material';

/**
 * Placeholder landing screen. Its only job right now is to prove the Mission
 * Portal theme is wired end-to-end (typography, palette, component overrides).
 * The visual policy builder canvas (see proposal §4) will replace this.
 */
export default function App() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
            CFEngine Policy Builder
          </Typography>
          <Typography color="text.muted">Build valid CFEngine policy visually — Electron + React shell with the Mission Portal theme.</Typography>
        </Box>
      </Stack>
    </Container>
  );
}
