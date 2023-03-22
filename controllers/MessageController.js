import MessageModel from "../Models/Message.js";
import createError from "../middlewares/errorHandling.js";

const MessageController = {
    getConversations: async (req, res, next) => {
        try {
            const row = await MessageModel.getConversations(req);
            if (!row.length) {
                return next(createError(404, 'No Conversations Found'));
            }
            const OppositeUser = await Promise.all(row.map(async conversation => {
                const getUser = await MessageModel.OppositeUser(req, conversation);
                return {
                    ...conversation,
                    friend: getUser
                }
            }))
            res.status(200).json(OppositeUser);
        } catch (err) {
            return next(err);
        }
    },
    getConversation: async (req, res, next) => {
        try {
            const { conversationId } = req.params;
            const row = await MessageModel.getConversation(conversationId);
            res.status(200).json(row);
        } catch (err) {
            return next(err);
        }
    },
    createConversation: async (req, res, next) => {
        try {
            const { senderId, receiverId } = req.body;
            const row = await MessageModel.createConversation(senderId, receiverId);
             
            if(row.insertId) {
                const newConversation = await MessageModel.getConversation(row.insertId);
                res.status(201).json({ message: 'Conversation created', newConversation });
            } else {
                res.status(200).json({ message: 'Conversation already exists', row });
            }

        } catch (err) {
            return next(err);
        }
    },
    createMessage: async (req, res, next) => {
        try {
            const row = await MessageModel.createMessage(req);
            res.status(201).json({ message: 'Message created' });
        } catch (err) {
            return next(err);
        }
    },
    getMessages: async (req, res, next) => {
        try {
            const row = await MessageModel.getMessages(req);
            const getMessageUser = await Promise.all(row.map(async message => {
                const getUser = await MessageModel.getMessageUser(req, message);
                const { password, ...getUserWithoutPassword } = getUser;
                return {
                    ...message,
                    sender: getUserWithoutPassword
                }
            }))
            res.status(200).json(getMessageUser);
        } catch (err) {
            return next(err);
        }
    }
};

export default MessageController;