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

const profileCache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 30000; // 30 seconds

export const UsersService = {
    /**
     * Universal Identity Hook: Ensures user has a normalized, discoverable record in chat.users.
     */
    async ensureGlobalProfile(user: any) {
        if (!user?.$id) return null;

        try {
            const prefs = await account.getPrefs();
            let username = prefs?.username || user.name || user.email.split('@')[0];
            
            // Normalize: lowercase, no @, clean alphanumeric
            username = username.toLowerCase().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
            if (!username) username = `user_${user.$id.slice(0, 8)}`;

            let profile;
            try {
                profile = await tablesDB.getRow(DB_ID, USERS_TABLE, user.$id);
            } catch (e: any) {
                if (e.code !== 404) throw e;
                profile = null;
            }

            const profileData = {
                username,
                displayName: user.name || username,
                updatedAt: new Date().toISOString(),
                privacySettings: JSON.stringify({ public: true, searchable: true }),
                avatarUrl: user.avatarUrl || null,
                appsActive: ['connect'],
            };

            if (!profile) {
                console.log('[UsersService] Initializing global profile for:', user.$id);
                await tablesDB.createRow(DB_ID, USERS_TABLE, user.$id, {
                    ...profileData,
                    createdAt: new Date().toISOString()
                }, [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]);
            } else {
                // Healing Logic: Fix broken or private-by-mistake profiles
                const isMalformed = profile.username !== username || !profile.privacySettings || profile.privacySettings.includes('"public":false');
                if (isMalformed) {
                    console.log('[UsersService] Healing global profile for:', user.$id);
                    await tablesDB.updateRow(DB_ID, USERS_TABLE, user.$id, profileData);
                }
            }

            if (prefs.username !== username) {
                await account.updatePrefs({ ...prefs, username });
            }

            return username;
        } catch (e) {
            console.warn('[UsersService] ensureGlobalProfile failed:', e);
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

        // 1. Primary Search in Global Directory (Connect)
        const res = await tablesDB.listRows(DB_ID, USERS_TABLE, [
            Query.or([
                Query.startsWith('username', cleaned.toLowerCase()),
                Query.startsWith('displayName', cleaned)
            ]),
            Query.limit(10)
        ]);

        // 2. Fallback to Note Users if search is empty or small
        if (res.total < 5 && WHISPERRNOTE_USERS_TABLE) {
            try {
                const noteRes = await tablesDB.listRows(WHISPERRNOTE_DB_ID, WHISPERRNOTE_USERS_TABLE, [
                    Query.or([
                        Query.startsWith('name', cleaned),
                        Query.startsWith('email', cleaned.toLowerCase())
                    ]),
                    Query.limit(5)
                ]);

                // Map note users to common format and merge
                for (const noteUser of noteRes.rows) {
                    if (!res.rows.find((r: any) => r.$id === noteUser.$id)) {
                        res.rows.push({
                            $id: noteUser.$id,
                            username: noteUser.email?.split('@')[0] || noteUser.$id.slice(0, 8),
                            displayName: noteUser.name,
                            avatarUrl: noteUser.profilePicId || noteUser.avatar || null,
                            privacySettings: JSON.stringify({ public: true, searchable: true })
                        } as any);
                        res.total++;
                    }
                }
            } catch (e) {
                console.warn('[UsersService] Note fallback search failed:', e);
            }
        }

        profileCache.set(cacheKey, { data: res, expires: Date.now() + 10000 }); // 10s for search
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
