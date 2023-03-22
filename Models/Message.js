import { db2 } from "../connect.js";

const MessageModel = {
    createConversation: async (senderId, receiverId) => {
         // Check if conversation already exists
        const [conversationExists] = await db2.query(
            'SELECT * FROM conversations WHERE sender_id = ? AND receiver_id = ? OR sender_id = ? AND receiver_id = ?',
            [senderId, receiverId, receiverId, senderId]
        );
        if (conversationExists.length) {
            return conversationExists[0];
        }

        const [conversation] = await db2.query(
            'INSERT INTO conversations (sender_id, receiver_id, createdAt) VALUES (?, ?, NOW())',
            [senderId, receiverId]
        );
        return conversation;
    },
    getConversations: async (req) => {
        const [conversations] = await db2.query(
            'SELECT * FROM conversations WHERE sender_id = ? OR receiver_id = ?',
            [req.user.id, req.user.id]
        );
        return conversations;
    },  
    OppositeUser: async (req, conversation) => {
        const oppositeUser = conversation.sender_id === req.user.id ? conversation.receiver_id : conversation.sender_id;
        const [user] = await db2.query('SELECT * FROM users WHERE id = ?', [oppositeUser]);
        return user[0];
    },
    getConversation: async (conversationId) => {        
        const [conversation] = await db2.query(
            'SELECT * FROM conversations WHERE con_id = ?',
            [conversationId]
        );
        return conversation;
    },
    createMessage: async (req) => {
        const { conversationId, message, senderId, receiverId } = req;
        const [messageRow] = await db2.query(
            'INSERT INTO messages (con_id, text, sender_id, receiver_id, createdAt) VALUES (?, ?, ?, ?, NOW())',
            [conversationId, message, senderId, receiverId]
        );
        return messageRow.insertId; 
    },
    getMessages: async (req) => {
        const { conversationId } = req.params;
        const [messages] = await db2.query(
            'SELECT * FROM messages WHERE con_id = ?',
            [conversationId]
        );
        return messages;
    },
    getMessageUser: async (req, message) => {
        const [user] = await db2.query('SELECT * FROM users WHERE id = ?', [message.sender_id]);
        return user[0];
    }
};

export default MessageModel;