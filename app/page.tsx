'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Feed } from '@/components/social/Feed';
import { Box, Typography, Container, Button, CircularProgress } from '@mui/material';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, login, isAuthenticating } = useAuth();
  const router = useRouter();

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
          <Typography variant="h3" fontWeight="900" mb={2} sx={{ fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.03em' }}>WhisperrConnect</Typography>
          <Typography variant="h6" color="text.secondary" mb={4} sx={{ maxWidth: 600, mx: 'auto' }}>
            Seamless communication for the modern workspace. Connect with your team and the Whisperr ecosystem.
          </Typography>
          {!user && (
            <Button 
              variant="contained" 
              size="large" 
              onClick={login}
              disabled={isAuthenticating}
              sx={{ minWidth: 200, py: 1.5, borderRadius: '12px', fontWeight: 800 }}
            >
              {isAuthenticating ? <CircularProgress size={24} color="inherit" /> : 'Get Started Free'}
            </Button>
          )}
        </Box>
        <Feed />
      </Container>
    </AppShell>
  );
}
