'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Box, 
    Drawer, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Typography, 
    useMediaQuery, 
    useTheme,
    Paper,
    BottomNavigation,
    BottomNavigationAction
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CallIcon from '@mui/icons-material/Call';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 280;

export const AppShell = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const navItems = [
        { label: 'Chats', href: '/', icon: <ChatIcon /> },
        { label: 'Calls', href: '/calls', icon: <CallIcon /> },
        { label: 'People', href: '/people', icon: <PeopleIcon /> },
        { label: 'Profile', href: '/profile', icon: <PersonIcon /> },
    ];

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="bold">WhisperrConnect</Typography>
                    </Box>
                    <Box sx={{ overflow: 'auto', mt: 2 }}>
                        <List>
                            {navItems.map((item) => (
                                <ListItem key={item.href} disablePadding>
                                    <ListItemButton 
                                        component={Link} 
                                        href={item.href}
                                        selected={pathname === item.href}
                                        sx={{ 
                                            borderRadius: 2, 
                                            mx: 1, 
                                            mb: 0.5,
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.light',
                                                color: 'primary.contrastText',
                                                '&:hover': { bgcolor: 'primary.main' },
                                                '& .MuiListItemIcon-root': { color: 'inherit' }
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: pathname === item.href ? 'inherit' : 'text.secondary' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>
            )}

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
                {children}
            </Box>

            {/* Mobile Bottom Nav */}
            {isMobile && (
                <Paper 
                    sx={{ 
                        position: 'fixed', 
                        bottom: 16, 
                        left: 16, 
                        right: 16, 
                        borderRadius: 4, 
                        overflow: 'hidden',
                        boxShadow: 3,
                        zIndex: 1000
                    }} 
                    elevation={3}
                >
                    <BottomNavigation
                        showLabels
                        value={pathname}
                        sx={{ bgcolor: 'background.paper' }}
                    >
                        {navItems.map((item) => (
                            <BottomNavigationAction
                                key={item.href}
                                label={item.label}
                                icon={item.icon}
                                component={Link}
                                href={item.href}
                                value={item.href}
                                sx={{ 
                                    '&.Mui-selected': { color: 'primary.main' }
                                }}
                            />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};
