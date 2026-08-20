import { useCallback, useState } from 'react';

import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';

/**
 * Proof that the bundled Python sidecar is reachable
 * Will be removed later.
 */

const SAMPLE_POLICY = `bundle agent main
{
  reports:
  "Hello CFEngine"     ;
}
`;

export default function PolicyFormatter() {
  const [source, setSource] = useState(SAMPLE_POLICY);
  const [error, setError] = useState<string | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);

  const formatPolicy = useCallback(async () => {
    // `window.api` is absent outside Electron (the Vitest jsdom environment).
    if (!window.api) {
      setError('The Python backend is only reachable from the Electron app.');
      return;
    }

    setIsFormatting(true);
    try {
      const formatted = await window.api.formatPolicy(source);
      setSource(current => (current === source ? formatted : current));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsFormatting(false);
    }
  }, [source]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Policy scratch pad</Typography>
        <Typography color="text.muted" variant="body2">
          Formatted by the bundled <code>cfengine format</code>, running in the Python sidecar.
        </Typography>
      </Box>

      <TextField
        multiline
        rows={16}
        variant="outlined"
        value={source}
        onChange={event => setSource(event.target.value)}
        label="CFEngine policy"
        sx={{
          height: 'auto',
          '& textarea': { fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }
        }}
      />

      <Box>
        <Button variant="contained" onClick={formatPolicy} loading={isFormatting}>
          Format
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}
