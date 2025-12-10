'use client';

import React, { useState } from 'react';
import { UsersService } from '@/lib/services/users';
import { Users } from '@/types/appwrite';
import { ChatService } from '@/lib/services/chat';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

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
            // Check if conversation exists (simplified: just create new for now or check existing)
            // Ideally we check if a direct chat with these participants exists.
            // For MVP, let's try to create one. If it fails (duplicate), we catch it or handle it.
            // But wait, createRow with unique ID will always create a new one.
            // We should check first.
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
        <div style={{ padding: '20px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search username..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px'
                    }}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#0070f3',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? '...' : 'Search'}
                </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.map((u) => (
                    <div 
                        key={u.$id}
                        style={{
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{u.displayName || u.username}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>@{u.username}</div>
                        </div>
                        <button
                            onClick={() => startChat(u.$id)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #0070f3',
                                backgroundColor: 'transparent',
                                color: '#0070f3',
                                cursor: 'pointer'
                            }}
                        >
                            Message
                        </button>
                    </div>
                ))}
                {results.length === 0 && query && !loading && (
                    <div style={{ textAlign: 'center', color: '#666' }}>No users found</div>
                )}
            </div>
        </div>
    );
};
