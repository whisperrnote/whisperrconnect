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
import { useNotifications } from '@/components/providers/NotificationProvider';
import EcosystemPortal from '../common/EcosystemPortal';
import { 
    Bell as BellIcon,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon,
    Clock as ClockIcon
} from "lucide-react";

export const AppHeader = () => {
    const theme = useTheme();
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [accountAnchorEl, setAccountAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState<null | HTMLElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
                e.preventDefault();
                setIsPortalOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
        setAccountAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAccountAnchorEl(null);
    };

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 0.5,
                bgcolor: 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(25px) saturate(180%)',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: 'none',
                color: 'text.primary',
                backgroundImage: 'none'
            }} 
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                        width: 38, 
                        height: 38, 
                        bgcolor: '#00F5FF', 
                        borderRadius: '10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#000',
                        fontWeight: 900
                    }}>
                        C
                    </Box>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 900, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.05em', color: 'white' }}>
                        WHISPERR<Box component="span" sx={{ color: '#00F5FF' }}>CONNECT</Box>
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
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '14px',
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.15)'
                        }
                    }}
                >
                    <InputBase
                        sx={{ ml: 2, flex: 1, color: 'white', fontSize: '0.9rem' }}
                        placeholder="Search messages, people, calls..."
                    />
                    <IconButton type="button" sx={{ p: '10px', color: 'rgba(255, 255, 255, 0.4)' }} aria-label="search">
                        <SearchIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Paper>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Notifications */}
                    <IconButton
                        onClick={(e) => setAnchorElNotifications(e.currentTarget)}
                        sx={{ 
                            borderRadius: '12px',
                            color: unreadCount > 0 ? '#00F5FF' : 'rgba(255, 255, 255, 0.4)',
                            bgcolor: unreadCount > 0 ? 'rgba(0, 245, 255, 0.05)' : 'transparent',
                            '&:hover': { bgcolor: 'rgba(0, 245, 255, 0.1)', color: '#00F5FF' },
                            position: 'relative'
                        }}
                    >
                        <BellIcon size={20} />
                        {unreadCount > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                bgcolor: '#FF4D4D',
                                color: 'white',
                                fontSize: '0.6rem',
                                fontWeight: 900,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #0A0A0A',
                            }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Box>
                        )}
                    </IconButton>

                    {/* Portal Toggle */}
                    <IconButton 
                        onClick={() => setIsPortalOpen(true)} 
                        sx={{ 
                            borderRadius: '12px',
                            color: '#00F5FF',
                            bgcolor: 'rgba(0, 245, 255, 0.05)',
                            border: '1px solid rgba(0, 245, 255, 0.1)',
                            '&:hover': { bgcolor: 'rgba(0, 245, 255, 0.1)', borderColor: '#00F5FF' }
                        }}
                    >
                        <AppsIcon sx={{ fontSize: 22 }} />
                    </IconButton>

                    {/* Account Menu Button */}
                    <IconButton onClick={handleAccountClick} sx={{ p: 0.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: '#00F5FF', color: '#000', fontSize: 14, fontWeight: 800, borderRadius: '10px' }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Avatar>
                    </IconButton>
                </Box>

                {/* Account Menu */}
                <Menu
                    anchorEl={accountAnchorEl}
                    open={Boolean(accountAnchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: { 
                            width: 240, 
                            mt: 1.5, 
                            borderRadius: '20px',
                            bgcolor: 'rgba(10, 10, 10, 0.95)',
                            backdropFilter: 'blur(25px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            backgroundImage: 'none'
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2.5, py: 2 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 800, color: 'white' }}>
                            {user?.name || 'User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)' }} noWrap>
                            {user?.email}
                        </Typography>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                    <MenuItem onClick={handleClose} sx={{ py: 1.5, px: 2.5, fontWeight: 600, color: 'white' }}>Profile</MenuItem>
                    <MenuItem 
                        onClick={() => {
                            window.location.href = `https://${process.env.NEXT_PUBLIC_AUTH_SUBDOMAIN || 'id'}.${process.env.NEXT_PUBLIC_DOMAIN || 'whisperrnote.space'}/settings?source=${encodeURIComponent(window.location.origin)}`;
                            handleClose();
                        }}
                        sx={{ py: 1.5, px: 2.5, fontWeight: 600, color: 'white' }}
                    >
                        Settings
                    </MenuItem>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                    <MenuItem onClick={() => logout()} sx={{ py: 1.5, px: 2.5, color: '#FF4D4D', fontWeight: 800 }}>Logout</MenuItem>
                </Menu>

                {/* Notifications Menu */}
                <Menu
                    anchorEl={anchorElNotifications}
                    open={Boolean(anchorElNotifications)}
                    onClose={() => setAnchorElNotifications(null)}
                    PaperProps={{
                        elevation: 0,
                        sx: { 
                            width: 320, 
                            mt: 1.5, 
                            borderRadius: '20px',
                            bgcolor: 'rgba(10, 10, 10, 0.95)',
                            backdropFilter: 'blur(25px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                            backgroundImage: 'none'
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white' }}>
                            Intelligence Feed
                        </Typography>
                        {unreadCount > 0 && (
                            <Typography 
                                variant="caption" 
                                onClick={() => { markAllAsRead(); setAnchorElNotifications(null); }}
                                sx={{ cursor: 'pointer', fontWeight: 800, color: '#00F5FF', '&:hover': { textDecoration: 'underline' } }}
                            >
                                MARK ALL READ
                            </Typography>
                        )}
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                    <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <ClockIcon size={24} color="rgba(255, 255, 255, 0.1)" style={{ marginBottom: 12, marginLeft: 'auto', marginRight: 'auto' }} />
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600, display: 'block' }}>
                                    No recent activity detected
                                </Typography>
                            </Box>
                        ) : (
                            notifications.slice(0, 10).map((notif) => {
                                const isRead = !!localStorage.getItem(`read_notif_${notif.$id}`);
                                return (
                                    <MenuItem 
                                        key={notif.$id} 
                                        onClick={() => { markAsRead(notif.$id); setAnchorElNotifications(null); }}
                                        sx={{ 
                                            py: 1.5, 
                                            px: 2.5, 
                                            gap: 2,
                                            borderLeft: isRead ? 'none' : '3px solid #00F5FF',
                                            bgcolor: isRead ? 'transparent' : alpha('#00F5FF', 0.03),
                                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } 
                                        }}
                                    >
                                        <Box sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            borderRadius: '8px', 
                                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {notif.action.toLowerCase().includes('delete') ? (
                                                <XCircleIcon size={16} color="#FF4D4D" />
                                            ) : (
                                                <CheckCircleIcon size={16} color="#00F5FF" />
                                            )}
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'white', display: 'block', lineHeight: 1.2 }}>
                                                {notif.action.toUpperCase()}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem', display: 'block', noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {notif.targetType}: {notif.details || notif.targetId}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                );
                            })
                        )}
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                    <MenuItem sx={{ py: 1.5, justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.05em' }}>
                            VIEW ALL ACTIVITY
                        </Typography>
                    </MenuItem>
                </Menu>

                <EcosystemPortal 
                    open={isPortalOpen} 
                    onClose={() => setIsPortalOpen(false)} 
                />
            </Toolbar>
        </AppBar>
    );
};

