import { ID, Query, Permission, Role } from 'appwrite';
import { tablesDB, realtime } from '../appwrite/client';
import { APPWRITE_CONFIG } from '../appwrite/config';

const DB_ID = APPWRITE_CONFIG.DATABASES.CHAT;
const MOMENTS_TABLE = APPWRITE_CONFIG.TABLES.CHAT.MOMENTS;
const FOLLOWS_TABLE = APPWRITE_CONFIG.TABLES.CHAT.FOLLOWS;
const INTERACTIONS_TABLE = APPWRITE_CONFIG.TABLES.CHAT.INTERACTIONS;

export const SocialService = {
    async getFeed(userId: string) {
        // Fetch public moments or moments from followed users
        return await tablesDB.listRows(DB_ID, MOMENTS_TABLE, [
            Query.orderDesc('createdAt'),
            Query.limit(50)
        ]);
    },

    subscribeToFeed(callback: (event: { type: 'create' | 'update' | 'delete', payload: any }) => void) {
        const channel = `databases.${DB_ID}.collections.${MOMENTS_TABLE}.documents`;
        return realtime.subscribe(channel, (response) => {
            const payload = response.payload;
            let type: 'create' | 'update' | 'delete' | null = null;

            if (response.events.some(e => e.includes('.create'))) type = 'create';
            else if (response.events.some(e => e.includes('.update'))) type = 'update';
            else if (response.events.some(e => e.includes('.delete'))) type = 'delete';

            if (type) {
                callback({ type, payload });
            }
        });
    },

    async createMoment(creatorId: string, content: string, type: 'text' | 'image' | 'video' = 'text', mediaIds: string[] = [], visibility: 'public' | 'private' | 'followers' = 'public') {
        const permissions = [
            Permission.read(Role.user(creatorId)),
            Permission.update(Role.user(creatorId)),
            Permission.delete(Role.user(creatorId)),
        ];

        if (visibility === 'public') {
            permissions.push(Permission.read(Role.any()));
            permissions.push(Permission.read(Role.guests()));
        }

        return await tablesDB.createRow(DB_ID, MOMENTS_TABLE, ID.unique(), {
            userId: creatorId, // Use userId consistent with schema if needed
            content,
            type,
            fileId: mediaIds[0] || null, // Moments schema uses fileId
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Moments expire in 24h
        }, permissions);
    },

    async deleteMoment(momentId: string) {
        return await tablesDB.deleteRow(DB_ID, MOMENTS_TABLE, momentId);
    },

    async updateMomentVisibility(momentId: string, visibility: 'public' | 'private' | 'followers') {
        return await tablesDB.updateRow(DB_ID, MOMENTS_TABLE, momentId, { visibility });
    },

    async likeMoment(userId: string, momentId: string) {
        return await tablesDB.createRow(DB_ID, INTERACTIONS_TABLE, ID.unique(), {
            userId,
            momentId,
            type: 'like',
            createdAt: new Date().toISOString()
        });
    },

    async followUser(followerId: string, followingId: string) {
        return await tablesDB.createRow(DB_ID, FOLLOWS_TABLE, ID.unique(), {
            followerId,
            followingId,
            status: 'accepted',
            createdAt: new Date().toISOString()
        });
    }
};
