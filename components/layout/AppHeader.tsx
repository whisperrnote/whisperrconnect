'use client';

import React, { useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    IconButton, 
    Box, 
    Paper, 
    InputBase, 
    useTheme, 
    alpha,
    Menu,
    MenuItem,
    Avatar,
    Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AppsIcon from '@mui/icons-material/Apps';
import { ECOSYSTEM_APPS } from '@/lib/constants';
import { useAuth } from '@/lib/auth';

export const AppHeader = () => {
    const theme = useTheme();
    const { user, logout } = useAuth();
    const [appsAnchorEl, setAppsAnchorEl] = useState<null | HTMLElement>(null);
    const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(null);

    const handleAppsClick = (event: React.MouseEvent<HTMLElement>) => {
        setAppsAnchorEl(event.currentTarget);
    };

    const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
        setAccountAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAppsAnchorEl(null);
        setAccountAnchorEl(null);
    };

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
                color: 'text.primary'
            }} 
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: 280 }}>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, backgroundClip: 'text', textFillColor: 'transparent', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        WhisperrConnect
                    </Typography>
                </Box>
                
                {/* Search */}
                <Paper
                    component="form"
                    sx={{ 
                        p: '2px 4px', 
                        display: { xs: 'none', md: 'flex' }, 
                        alignItems: 'center', 
                        width: 400,
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 3,
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.text.primary, 0.08),
                        }
                    }}
                >
                    <InputBase
                        sx={{ ml: 2, flex: 1 }}
                        placeholder="Search messages, people, calls..."
                    />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Apps Menu Button */}
                    <IconButton onClick={handleAppsClick} sx={{ borderRadius: 3 }}>
                        <AppsIcon />
                    </IconButton>

                    {/* Account Menu Button */}
                    <IconButton onClick={handleAccountClick} sx={{ p: 0.5, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14, fontWeight: 'bold' }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Apps Menu */}
                <Menu
                    anchorEl={appsAnchorEl}
                    open={Boolean(appsAnchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: { 
                            width: 320, 
                            mt: 1.5, 
                            p: 2, 
                            borderRadius: 4, 
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: theme.shadows[4]
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Typography variant="overline" sx={{ px: 1, color: 'text.secondary', fontWeight: 700 }}>
                        Whisperr Ecosystem
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1 }}>
                        {ECOSYSTEM_APPS.map((app) => (
                            <Box
                                key={app.name}
                                component="a"
                                href={app.url}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    p: 1.5,
                                    borderRadius: 3,
                                    textDecoration: 'none',
                                    color: 'text.primary',
                                    bgcolor: app.active ? alpha(app.color, 0.1) : 'transparent',
                                    border: app.active ? `1px solid ${alpha(app.color, 0.3)}` : '1px solid transparent',
                                    '&:hover': {
                                        bgcolor: alpha(app.color, 0.15),
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s'
                                    },
                                }}
                            >
                                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>{app.icon}</Box>
                                <Typography variant="caption" fontWeight={600}>{app.shortName}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Menu>

                {/* Account Menu */}
                <Menu
                    anchorEl={accountAnchorEl}
                    open={Boolean(accountAnchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: { 
                            width: 200, 
                            mt: 1.5, 
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: theme.shadows[4]
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" noWrap fontWeight={700}>
                            {user?.name || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {user?.email}
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>Settings</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => logout()} sx={{ color: 'error.main' }}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};
