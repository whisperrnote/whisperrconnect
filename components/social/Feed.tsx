'use client';

import React, { useEffect, useState } from 'react';
import { SocialService } from '@/lib/services/social';
import { UsersService } from '@/lib/services/users';
import { ChatService } from '@/lib/services/chat';
import { useAuth } from '@/lib/auth';
import { 
    Box, 
    Card, 
    CardHeader, 
    CardContent, 
    CardActions, 
    Avatar, 
    Typography, 
    IconButton, 
    TextField, 
    Button,
    CircularProgress,
    Divider,
    Menu,
    MenuItem,
    alpha
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import CommentIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import SendIcon from '@mui/icons-material/SendOutlined';
import BookmarkIcon from '@mui/icons-material/BookmarkBorderOutlined';
import { useRouter } from 'next/navigation';

export const Feed = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [moments, setMoments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMoment, setNewMoment] = useState('');
    const [posting, setPosting] = useState(false);
    
    const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedMoment, setSelectedMoment] = useState<any>(null);

    useEffect(() => {
        if (user) {
            loadFeed();
        }
    }, [user]);

    const loadFeed = async () => {
        try {
            const response = await SocialService.getFeed(user!.$id);
            // Enrich with creator details
            const enriched = await Promise.all(response.rows.map(async (moment: any) => {
                try {
                    const creatorId = moment.userId || moment.creatorId;
                    const creator = await UsersService.getProfileById(creatorId);
                    return { ...moment, creator };
                } catch (e) {
                    return { ...moment, creator: { username: 'user', $id: moment.userId || moment.creatorId } };
                }
            }));
            setMoments(enriched);
        } catch (error) {
            console.error('Failed to load feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePost = async () => {
        if (!newMoment.trim() || !user) return;
        setPosting(true);
        try {
            await SocialService.createMoment(user.$id, newMoment);
            setNewMoment('');
            loadFeed();
        } catch (error) {
            console.error('Failed to post:', error);
        } finally {
            setPosting(false);
        }
    };

    const handleForwardToSaved = async (moment: any) => {
        if (!user) return;
        try {
            // Find saved messages conversation
            const convs = await ChatService.getConversations(user.$id);
            const savedChat = convs.rows.find((c: any) => 
                c.type === 'direct' && c.participants.length === 1 && c.participants[0] === user.$id
            );

            if (savedChat) {
                await ChatService.sendMessage(
                    savedChat.$id, 
                    user.$id, 
                    `Forwarded Moment from @${moment.creator?.username}:\n\n${moment.content}`,
                    'text'
                );
                alert('Saved to Messages');
            }
        } catch (e) {
            console.error('Forward failed:', e);
        }
        setShareAnchorEl(null);
    };

    const handleForwardToChat = (moment: any) => {
        // In a real app, this would open a 'Select Contact' dialog
        // For now, let's redirect to chats with a hint
        router.push('/chats');
        setShareAnchorEl(null);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: 'primary.main' }} /></Box>;

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 1, sm: 2 } }}>
            {/* Create Post */}
            {user && (
                <Card sx={{ mb: 4, borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }} elevation={0}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'rgba(0, 240, 255, 0.1)', color: 'primary.main', fontWeight: 800 }}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                            <TextField
                                fullWidth
                                placeholder="Share an update with the ecosystem..."
                                multiline
                                rows={2}
                                variant="standard"
                                InputProps={{ 
                                    disableUnderline: true,
                                    sx: { fontSize: '1.1rem', fontWeight: 500 }
                                }}
                                value={newMoment}
                                onChange={(e) => setNewMoment(e.target.value)}
                            />
                        </Box>
                    </CardContent>
                    <Divider sx={{ opacity: 0.05 }} />
                    <CardActions sx={{ justifyContent: 'flex-end', p: 2, bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
                        <Button 
                            variant="contained" 
                            disabled={!newMoment.trim() || posting}
                            onClick={handlePost}
                            sx={{ 
                                borderRadius: '12px', 
                                px: 4, 
                                fontWeight: 800,
                                textTransform: 'none',
                                bgcolor: 'primary.main',
                                color: 'black',
                                '&:hover': { bgcolor: alpha('#00F0FF', 0.8) }
                            }}
                        >
                            {posting ? <CircularProgress size={20} color="inherit" /> : 'Post'}
                        </Button>
                    </CardActions>
                </Card>
            )}

            {/* Feed */}
            {moments.map((moment) => (
                <Card key={moment.$id} sx={{ mb: 3, borderRadius: '24px', bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', transition: 'all 0.2s ease', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }} elevation={0}>
                    <CardHeader
                        avatar={
                            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.secondary', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                {moment.creator?.username?.charAt(0).toUpperCase() || '?'}
                            </Avatar>
                        }
                        title={
                            <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>
                                {moment.creator?.displayName || moment.creator?.username || 'Unknown'}
                            </Typography>
                        }
                        subheader={
                            <Typography variant="caption" sx={{ opacity: 0.5, fontWeight: 600 }}>
                                {new Date(moment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        }
                    />
                    <CardContent sx={{ pt: 0, px: 3 }}>
                        <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: '1.05rem' }}>
                            {moment.content}
                        </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                        <Button 
                            startIcon={<FavoriteBorderIcon />} 
                            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 700, borderRadius: '10px', '&:hover': { color: '#ff4d4d', bgcolor: alpha('#ff4d4d', 0.1) } }}
                        >
                            Like
                        </Button>
                        <Button 
                            startIcon={<CommentIcon />} 
                            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
                        >
                            Reply
                        </Button>
                        <IconButton 
                            onClick={(e) => { setShareAnchorEl(e.currentTarget); setSelectedMoment(moment); }}
                            sx={{ ml: 'auto', color: 'text.secondary' }}
                        >
                            <ShareIcon />
                        </IconButton>
                    </CardActions>
                </Card>
            ))}
            
            <Menu
                anchorEl={shareAnchorEl}
                open={Boolean(shareAnchorEl)}
                onClose={() => setShareAnchorEl(null)}
                PaperProps={{
                    sx: {
                        mt: 1,
                        borderRadius: '16px',
                        bgcolor: 'rgba(15, 15, 15, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        minWidth: 200
                    }
                }}
            >
                <MenuItem onClick={() => handleForwardToSaved(selectedMoment)} sx={{ gap: 1.5, py: 1.2, fontWeight: 600 }}>
                    <BookmarkIcon sx={{ fontSize: 20, opacity: 0.7 }} /> Save to Messages
                </MenuItem>
                <MenuItem onClick={() => handleForwardToChat(selectedMoment)} sx={{ gap: 1.5, py: 1.2, fontWeight: 600 }}>
                    <SendIcon sx={{ fontSize: 20, opacity: 0.7 }} /> Forward to Chat
                </MenuItem>
            </Menu>

            {moments.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10, bgcolor: 'rgba(255, 255, 255, 0.01)', borderRadius: '32px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                    <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>No moments in the feed yet.</Typography>
                    <Typography variant="body2" sx={{ color: 'text.disabled', mt: 1 }}>Be the first to share an update!</Typography>
                </Box>
            )}
        </Box>
    );
};
