import { ID, Query } from 'appwrite';
import { tablesDB } from '../appwrite/client';
import { APPWRITE_CONFIG } from '../appwrite/config';

const DB_ID = APPWRITE_CONFIG.DATABASES.CHAT;
const CONV_TABLE = APPWRITE_CONFIG.TABLES.CHAT.CONVERSATIONS;
const MSG_TABLE = APPWRITE_CONFIG.TABLES.CHAT.MESSAGES;

export const ChatService = {
    async getConversations(userId: string) {
        return await tablesDB.listRows(DB_ID, CONV_TABLE, [
            Query.search('participants', userId),
            Query.orderDesc('lastMessageAt')
        ]);
    },

    async createConversation(participants: string[], type: 'direct' | 'group' = 'direct', name?: string) {
        return await tablesDB.createRow(DB_ID, CONV_TABLE, ID.unique(), {
            participants,
            type,
            name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    },

    async getMessages(conversationId: string, limit = 50, offset = 0) {
        return await tablesDB.listRows(DB_ID, MSG_TABLE, [
            Query.equal('conversationId', conversationId),
            Query.orderDesc('createdAt'),
            Query.limit(limit),
            Query.offset(offset)
        ]);
    },

    async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'call_signal' = 'text', attachments: string[] = []) {
        const now = new Date().toISOString();
        
        // 1. Create Message
        const message = await tablesDB.createRow(DB_ID, MSG_TABLE, ID.unique(), {
            conversationId,
            senderId,
            content,
            type,
            attachments,
            createdAt: now,
            updatedAt: now
        });

        // 2. Update Conversation Last Message
        await tablesDB.updateRow(DB_ID, CONV_TABLE, conversationId, {
            lastMessageId: message.$id,
            lastMessageAt: now,
            updatedAt: now
        });

        return message;
    }
};
