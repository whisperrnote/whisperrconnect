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
    BottomNavigationAction,
    AppBar,
    Toolbar,
    IconButton,
    InputBase,
    alpha
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '@/components/providers/ThemeProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const drawerWidth = 280;

export const AppShell = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const theme = useTheme();
    const colorMode = useColorMode();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const isProfilePage = pathname === '/profile' || pathname?.startsWith('/u/');

    const navItems = [
        { label: 'Home', href: '/', icon: <HomeIcon /> },
        { label: 'Chats', href: '/chats', icon: <ChatIcon /> },
        { label: 'Calls', href: '/calls', icon: <CallIcon /> },
        { label: 'Profile', href: '/profile', icon: <PersonIcon /> },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push('/');
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#000000' }}>
            {/* Top Bar (AppBar) */}
            <AppBar 
                position="fixed" 
                sx={{ 
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid',
                    borderColor: 'rgba(255, 255, 255, 0.08)'
                }} 
                elevation={0}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component="div" 
                        onClick={() => router.push('/')}
                        sx={{ 
                            fontWeight: 800, 
                            color: '#00F0FF',
                            fontFamily: 'var(--font-space-grotesk)',
                            letterSpacing: '-0.02em',
                            cursor: 'pointer'
                        }}
                    >
                        WhisperrConnect
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Search */}
                        <Box
                            component="form"
                            onSubmit={handleSearch}
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                width: isMobile ? 150 : 300,
                                bgcolor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid',
                                borderColor: 'rgba(255, 255, 255, 0.08)',
                                borderRadius: '12px',
                                px: 1.5,
                                transition: 'all 0.2s ease',
                                '&:hover': { 
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    borderColor: 'rgba(255, 255, 255, 0.2)'
                                }
                            }}
                        >
                            <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <InputBase
                                sx={{ ml: 1, flex: 1, color: 'text.primary', fontSize: '0.875rem' }}
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Box>

                        <IconButton onClick={colorMode.toggleColorMode} sx={{ color: 'text.secondary' }}>
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Desktop Sidebar */}
            {!isMobile && !isProfilePage && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { 
                            width: drawerWidth, 
                            boxSizing: 'border-box', 
                            top: 64, 
                            height: 'calc(100% - 64px)',
                            bgcolor: '#000000',
                            borderRight: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.08)'
                        },
                    }}
                >
                    <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
                        <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
                            {navItems.map((item) => (
                                <ListItem key={item.href} disablePadding>
                                    <ListItemButton 
                                        component={Link} 
                                        href={item.href}
                                        selected={pathname === item.href}
                                        sx={{ 
                                            borderRadius: '12px', 
                                            transition: 'all 0.2s ease',
                                            '&.Mui-selected': {
                                                bgcolor: 'rgba(0, 240, 255, 0.1)',
                                                color: '#00F0FF',
                                                '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.15)' },
                                                '& .MuiListItemIcon-root': { color: '#00F0FF' }
                                            },
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: pathname === item.href ? '#00F0FF' : 'text.secondary' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={item.label} 
                                            primaryTypographyProps={{ 
                                                fontWeight: pathname === item.href ? 700 : 500,
                                                fontSize: '0.9rem'
                                            }} 
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>
            )}

            {/* Main Content */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    height: '100%', 
                    overflow: 'hidden', 
                    position: 'relative', 
                    pt: '64px',
                    bgcolor: '#000000',
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                <Box sx={{ 
                    height: '100%', 
                    p: { xs: 2, md: 3 },
                    overflowY: 'auto',
                    maxWidth: isProfilePage ? '1200px' : 'auto',
                    mx: isProfilePage ? 'auto' : 'unset'
                }}>

                    <Paper
                        elevation={0}
                        sx={{
                            minHeight: '100%',
                            bgcolor: 'rgba(10, 10, 10, 0.7)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            borderRadius: '24px',
                            border: '1px solid',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            p: { xs: 2, md: 4 }
                        }}
                    >
                        {children}
                    </Paper>
                </Box>
            </Box>

            {/* Mobile Bottom Nav */}
            {isMobile && (
                <Paper 
                    elevation={0}
                    sx={{ 
                        position: 'fixed', 
                        bottom: 24, 
                        left: 24, 
                        right: 24, 
                        borderRadius: '20px', 
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                        bgcolor: 'rgba(10, 10, 10, 0.8)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 1000
                    }} 
                >
                    <BottomNavigation
                        showLabels
                        value={pathname}
                        sx={{ bgcolor: 'transparent', height: 72 }}
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
                                    color: 'text.secondary',
                                    '&.Mui-selected': { 
                                        color: '#00F0FF',
                                        '& .MuiBottomNavigationAction-label': {
                                            fontWeight: 700,
                                            fontSize: '0.75rem'
                                        }
                                    }
                                }}
                            />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};
