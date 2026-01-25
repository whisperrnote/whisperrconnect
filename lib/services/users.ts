import { ID, Query, Permission, Role } from 'appwrite';
import { tablesDB, account } from '../appwrite/client';
import { APPWRITE_CONFIG } from '../appwrite/config';

const DB_ID = APPWRITE_CONFIG.DATABASES.CHAT;
const USERS_TABLE = APPWRITE_CONFIG.TABLES.CHAT.USERS;
const WHISPERRNOTE_DB_ID = APPWRITE_CONFIG.DATABASES.WHISPERRNOTE;
const WHISPERRNOTE_USERS_TABLE = APPWRITE_CONFIG.TABLES.WHISPERRNOTE?.USERS;

const normalizeUsername = (input: string | null | undefined): string | null => {
    if (!input) return null;
    const cleaned = input
        .toString()
        .trim()
        .replace(/^@+/, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '');
    return cleaned || null;
};

const SYNC_CACHE_KEY = 'whisperr_identity_synced_v2';
const SESSION_SYNC_KEY = 'whisperr_session_identity_ok';

export const UsersService = {
    /**
     * Universal Identity Hook: Efficiently ensures user has a discoverable record in chat.users.
     */
    async ensureGlobalProfile(user: any, force = false) {
        if (!user?.$id || typeof window === 'undefined') return null;

        // Caching Layers
        if (!force && sessionStorage.getItem(SESSION_SYNC_KEY)) return null;
        const lastSync = localStorage.getItem(SYNC_CACHE_KEY);
        if (!force && lastSync && (Date.now() - parseInt(lastSync)) < 24 * 60 * 60 * 1000) {
            sessionStorage.setItem(SESSION_SYNC_KEY, '1');
            return null;
        }

        try {
            const [prefs, profile] = await Promise.all([
                account.getPrefs(),
                tablesDB.getRow(DB_ID, USERS_TABLE, user.$id).catch(() => null)
            ]);

            let username = prefs?.username || user.name || user.email.split('@')[0];
            username = String(username).toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '').slice(0, 50);
            if (!username) username = `user_${user.$id.slice(0, 8)}`;

            const profileData = {
                username,
                displayName: user.name || username,
                updatedAt: new Date().toISOString(),
                avatarUrl: user.avatarUrl || null,
                walletAddress: prefs?.walletEth || null,
                bio: prefs?.bio || ""
            };

            if (!profile) {
                await tablesDB.createRow(DB_ID, USERS_TABLE, user.$id, {
                    ...profileData,
                    createdAt: new Date().toISOString()
                }, [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]);
            } else {
                if (profile.username !== username) {
                    await tablesDB.updateRow(DB_ID, USERS_TABLE, user.$id, profileData);
                }
            }

            if (prefs.username !== username) {
                await account.updatePrefs({ ...prefs, username });
            }

            localStorage.setItem(SYNC_CACHE_KEY, Date.now().toString());
            sessionStorage.setItem(SESSION_SYNC_KEY, '1');
            return username;
        } catch (e) {
            console.warn('[UsersService] ensureGlobalProfile deferred:', e);
            return null;
        }
    },

    async getProfile(username: string) {
        const normalized = normalizeUsername(username);
        if (!normalized) return null;

        const cacheKey = `u:${normalized}`;
        const cached = profileCache.get(cacheKey);
        if (cached && cached.expires > Date.now()) return cached.data;

        const result = await tablesDB.listRows(DB_ID, USERS_TABLE, [
            Query.equal('username', normalized),
            Query.limit(1)
        ]);
        const data = result.rows[0] || null;
        profileCache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });
        return data;
    },

    async getProfileById(userId: string) {
        try {
            return await tablesDB.getRow(DB_ID, USERS_TABLE, userId);
        } catch (e) {
            return null;
        }
    },

    async isUsernameAvailable(username: string) {
        const normalized = normalizeUsername(username);
        if (!normalized) return false;
        const result = await tablesDB.listRows(DB_ID, USERS_TABLE, [
            Query.equal('username', normalized)
        ]);
        return result.total === 0;
    },

    async updateProfile(userId: string, data: { username?: string; displayName?: string; bio?: string; avatarUrl?: string; appsActive?: string[] }) {
        // If updating username, check for availability first
        if (data.username) {
            const normalized = normalizeUsername(data.username);
            if (!normalized) {
                throw new Error('Invalid username');
            }
            const available = await this.isUsernameAvailable(normalized);
            if (!available) {
                // Check if it's the current user's own username
                const currentProfile = await this.getProfileById(userId);
                if (currentProfile?.username !== normalized) {
                    throw new Error('Username already taken');
                }
            }
            data.username = normalized;
        }
        return await tablesDB.updateRow(DB_ID, USERS_TABLE, userId, data);
    },

    async createProfile(
        userId: string,
        username: string,
        email: string,
        data: { displayName?: string; bio?: string; avatarUrl?: string; appsActive?: string[] } = {}
    ) {
        // Double check availability before creation
        const normalized = normalizeUsername(username);
        if (!normalized) {
            throw new Error('Invalid username');
        }
        const available = await this.isUsernameAvailable(normalized);
        if (!available) {
            throw new Error('Username already taken');
        }

        return await tablesDB.createRow(
            DB_ID,
            USERS_TABLE,
            userId,
            {
                username: normalized,
                displayName: data.displayName,
                bio: data.bio,
                avatarUrl: data.avatarUrl,
                appsActive: data.appsActive,
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

    async getWhisperrnoteUserById(userId: string) {
        if (!WHISPERRNOTE_USERS_TABLE) return null;
        try {
            return await tablesDB.getRow(WHISPERRNOTE_DB_ID, WHISPERRNOTE_USERS_TABLE, userId);
        } catch (e) {
            return null;
        }
    },

    async getWhisperrnoteUserByUsername(username: string) {
        if (!WHISPERRNOTE_USERS_TABLE) return null;
        const normalized = normalizeUsername(username);
        if (!normalized) return null;
        try {
            const result = await tablesDB.listRows(WHISPERRNOTE_DB_ID, WHISPERRNOTE_USERS_TABLE, [
                Query.equal('username', normalized),
                Query.limit(1)
            ]);
            return result.rows[0] || null;
        } catch (e) {
            return null;
        }
    },

    async ensureProfileForUser(user: { $id: string; email?: string; name?: string; prefs?: Record<string, any> }) {
        if (!user?.$id) return null;
        const existing = await this.getProfileById(user.$id);
        if (existing) return existing;

        let externalUser: any = null;
        try {
            externalUser = await this.getWhisperrnoteUserById(user.$id);
        } catch (e) {
            externalUser = null;
        }

        const base = externalUser?.username || user?.prefs?.username || user?.name || (user?.email ? user.email.split('@')[0] : '');
        let candidate = normalizeUsername(base) || `user${user.$id.slice(0, 6)}`;

        if (!await this.isUsernameAvailable(candidate)) {
            const suffix = user.$id.slice(0, 4);
            const withSuffix = normalizeUsername(`${candidate}-${suffix}`) || `${candidate}${suffix}`;
            candidate = withSuffix;
            if (!await this.isUsernameAvailable(candidate)) {
                const randomSuffix = Math.floor(Math.random() * 9000) + 1000;
                candidate = normalizeUsername(`${candidate}-${randomSuffix}`) || `${candidate}${randomSuffix}`;
            }
        }

        try {
            return await this.createProfile(user.$id, candidate, user?.email || '', {
                displayName: externalUser?.name || user?.name,
                appsActive: ['connect']
            });
        } catch (e) {
            return null;
        }
    },

    async searchUsers(query: string) {
        const cleaned = query.trim().replace(/^@/, '');
        if (!cleaned) return { rows: [], total: 0 };

        const cacheKey = `s:${cleaned.toLowerCase()}`;
        const cached = profileCache.get(cacheKey);
        if (cached && cached.expires > Date.now()) return cached.data;

        // 1. Primary Search: ONLY username (since it's the only one indexed in chat.users)
        let res: any = { rows: [], total: 0 };
        try {
            res = await tablesDB.listRows(DB_ID, USERS_TABLE, [
                Query.startsWith('username', cleaned.toLowerCase()),
                Query.limit(10)
            ]);
        } catch (e) {
            console.warn('[UsersService] Global username search failed:', e);
        }

        // 2. Fallback to Note Users: Search by 'name' (indexed via fulltext in note database)
        if (res.total < 5 && WHISPERRNOTE_USERS_TABLE) {
            try {
                // Query.search is required for fulltext indexes
                const noteRes = await tablesDB.listRows(WHISPERRNOTE_DB_ID, WHISPERRNOTE_USERS_TABLE, [
                    Query.search('name', cleaned),
                    Query.limit(5)
                ]);

                for (const noteUser of noteRes.rows) {
                    if (!res.rows.find((r: any) => r.$id === noteUser.$id)) {
                        res.rows.push({
                            $id: noteUser.$id,
                            username: noteUser.username || noteUser.email?.split('@')[0] || noteUser.$id.slice(0, 8),
                            displayName: noteUser.name,
                            avatarUrl: noteUser.profilePicId || noteUser.avatar || null
                        });
                        res.total++;
                    }
                }
            } catch (e) {
                console.warn('[UsersService] Note name fallback search failed:', e);
            }
        }

        profileCache.set(cacheKey, { data: res, expires: Date.now() + 10000 }); 
        return res;
    },

    async updatePresence(userId: string, status: 'online' | 'away' | 'busy' | 'offline', customStatus?: string) {
        return await tablesDB.updateRow(DB_ID, USERS_TABLE, userId, {
            presence: status,
            statusMessage: customStatus,
            lastSeen: new Date().toISOString()
        });
    }
};
