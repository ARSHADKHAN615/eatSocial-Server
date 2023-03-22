import MessageModel from "./Models/Message.js";

const SocketEvents = {
    init: (io) => {
        let users = [];
        // Add user to the list
        const addUser = (user, socketId) => {
            !users.some((u) => u.userId === user.userId) &&
                users.push({  ...user, socketId });
        };
        // Remove user from the list
        const removeUser = (socketId) => {
            users = users.filter((user) => user.socketId !== socketId);
        };
        // Get user from the list
        const getUser = (userId) => {
            return users.find((user) => user.userId === userId);
        };
        // Socket events
        io.on("connection", (socket) => {
            console.log(`a user connected: ${socket.id}`);
            // Add user to the list
            socket.on("addUser", (user) => {
                addUser(user, socket.id);
                io.emit("getUsers", users);
            });
            // Send message to the user
            socket.on("sendMessage", async({ conversationId, sender, receiver, text }) => {
                const user = getUser(receiver.userId);
                console.log("MessageReceiver", user);
                const message = await MessageModel.createMessage({ conversationId, message: text, senderId: sender.userId, receiverId: receiver.userId });
                if (user) {
                    io.to(user.socketId).emit("getMessage", {
                        conversationId,
                        sender,
                        receiver,
                        text,
                        message
                    });
                }
            });
            // Remove user from the list
            socket.on("disconnect", () => {
                console.log("a user disconnected");
                removeUser(socket.id);
                io.emit("getUsers", users);
            });
        });
    }
}

export default SocketEvents