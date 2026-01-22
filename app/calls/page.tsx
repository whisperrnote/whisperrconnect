'use client';

import { AppShell } from '@/components/layout/AppShell';
import { CallHistory } from '@/components/call/CallHistory';
import { Box, Typography, Container, CircularProgress } from '@mui/material';
import { Suspense } from 'react';

export default function CallsPage() {
    return (
        <AppShell>
            <Container maxWidth="md" sx={{ py: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>Call History</Typography>
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>}>
                    <CallHistory />
                </Suspense>
            </Container>
        </AppShell>
    );
}
