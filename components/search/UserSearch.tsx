'use client';

import React, { useState } from 'react';
import { UsersService } from '@/lib/services/users';
import { Users } from '@/types/appwrite';
import { ChatService } from '@/lib/services/chat';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
    Box, 
    TextField, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    ListItemAvatar, 
    Avatar, 
    Typography, 
    Paper,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import PersonIcon from '@mui/icons-material/Person';

export const UserSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Users[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await UsersService.searchUsers(query);
            // Filter out self and private users
            const filtered = response.rows.filter((u: any) => {
                if (u.$id === user?.$id) return false;
                if (u.privacySettings) {
                    try {
                        const settings = JSON.parse(u.privacySettings);
                        if (settings.searchable === false) return false;
                    } catch (e) {}
                }
                return true;
            }) as unknown as Users[];
            setResults(filtered);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const startChat = async (targetUserId: string) => {
        if (!user) return;
        try {
            const existing = await ChatService.getConversations(user.$id);
            const found = existing.rows.find((c: any) => 
                c.type === 'direct' && c.participants.includes(targetUserId)
            );

            if (found) {
                router.push(`/chat/${found.$id}`);
            } else {
                const newConv = await ChatService.createConversation([user.$id, targetUserId], 'direct');
                router.push(`/chat/${newConv.$id}`);
            }
        } catch (error) {
            console.error('Failed to start chat:', error);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Paper 
                component="form" 
                onSubmit={handleSearch} 
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', mb: 3 }}
            >
                <TextField
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search username..."
                    variant="standard"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{ disableUnderline: true }}
                />
                <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" disabled={loading}>
                    <SearchIcon />
                </IconButton>
            </Paper>

            <List>
                {results.map((u) => (
                    <Paper key={u.$id} sx={{ mb: 1, overflow: 'hidden' }} variant="outlined">
                        <ListItem
                            secondaryAction={
                                <Button 
                                    variant="outlined" 
                                    startIcon={<MessageIcon />}
                                    onClick={() => startChat(u.$id)}
                                    size="small"
                                    sx={{ borderRadius: 5 }}
                                >
                                    Message
                                </Button>
                            }
                        >
                            <ListItemAvatar>
                                <Avatar>
                                    <PersonIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={u.displayName || u.username}
                                secondary={`@${u.username}`}
                            />
                        </ListItem>
                    </Paper>
                ))}
                {results.length === 0 && query && !loading && (
                    <Typography align="center" color="text.secondary">No users found</Typography>
                )}
            </List>
        </Box>
    );
};
