import { ID, Query, Permission, Role } from 'appwrite';
import { tablesDB } from '../appwrite/client';
import { APPWRITE_CONFIG } from '../appwrite/config';

const DB_ID = APPWRITE_CONFIG.DATABASES.CHAT;
const USERS_TABLE = APPWRITE_CONFIG.TABLES.CHAT.USERS;

export const UsersService = {
    async getProfile(username: string) {
        const result = await tablesDB.listRows(DB_ID, USERS_TABLE, [
            Query.equal('username', username)
        ]);
        return result.rows[0] || null;
    },

    async getProfileById(userId: string) {
        try {
            return await tablesDB.getRow(DB_ID, USERS_TABLE, userId);
        } catch (e) {
            return null;
        }
    },

    async isUsernameAvailable(username: string) {
        if (!username) return false;
        const result = await tablesDB.listRows(DB_ID, USERS_TABLE, [
            Query.equal('username', username.toLowerCase())
        ]);
        return result.total === 0;
    },

    async updateProfile(userId: string, data: { username?: string; bio?: string; avatarUrl?: string; appsActive?: string[] }) {
        // If updating username, check for availability first
        if (data.username) {
            const available = await this.isUsernameAvailable(data.username);
            if (!available) {
                // Check if it's the current user's own username
                const currentProfile = await this.getProfileById(userId);
                if (currentProfile?.username !== data.username.toLowerCase()) {
                    throw new Error('Username already taken');
                }
            }
            data.username = data.username.toLowerCase();
        }
        return await tablesDB.updateRow(DB_ID, USERS_TABLE, userId, data);
    },

    async createProfile(userId: string, username: string, email: string) {
        // Double check availability before creation
        const available = await this.isUsernameAvailable(username);
        if (!available) {
            throw new Error('Username already taken');
        }

        return await tablesDB.createRow(
            DB_ID, 
            USERS_TABLE, 
            userId, 
            {
                username: username.toLowerCase(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            [
                Permission.read(Role.any()), // Public by default
                Permission.update(Role.user(userId)),
                Permission.delete(Role.user(userId))
            ]
        );
    },

    async searchUsers(query: string) {
        // Search by username or displayName
        // Note: Appwrite search queries might need specific indexes.
        // Assuming 'username' and 'displayName' are indexed (fulltext or key).
        // For MVP, we'll search username.
        return await tablesDB.listRows(DB_ID, USERS_TABLE, [
            Query.search('username', query),
            Query.limit(10)
        ]);
    }
};
