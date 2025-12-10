'use client';

import { AppShell } from '@/components/layout/AppShell';
import { CallHistory } from '@/components/call/CallHistory';
import { Box, Typography, Container } from '@mui/material';

export default function CallsPage() {
    return (
        <AppShell>
            <Container maxWidth="md" sx={{ py: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3}>Call History</Typography>
                <CallHistory />
            </Container>
        </AppShell>
    );
}
