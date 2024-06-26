"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let GLOBAL_ROOM_ID = 1;
class Users {
    constructor() {
        this.room = new Map;
        this.user = [];
        this.queue = [];
        this.userDisconnect = new Map;
    }
    createUser(socket, name, city) {
        console.log(`user connected ${socket.id}`);
        this.user.push({
            name, socket, city
        });
        this.queue.push(socket.id);
        this.clearQueue();
        this.handleQuery(socket);
    }
    removeUser(socket) {
        const user = this.user.find(x => x.socket.id === socket);
        //  const data = this.room.filter(([k,v])=>v===user)
        const roomId = this.userDisconnect.get(user);
        const room = this.room.get(roomId);
        if (room !== undefined) {
            const userF = room.user1 === user ? room.user2 : room.user1;
            userF.socket.emit('userdisconnected', 'user got disconnected');
        }
        this.user = this.user.filter(x => x.socket.id !== socket);
        this.queue = this.queue.filter(x => x !== socket);
    }
    clearQueue() {
        // console.log(this.queue.length);
        if (this.queue.length < 2) {
            return;
        }
        this.user.forEach(x => {
            console.log(x.socket.id);
        });
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        //  console.log(id1,id2);
        const user1 = this.user.find(x => x.socket.id === id1);
        const user2 = this.user.find(x => x.socket.id === id2);
        if (!user1 || !user2) {
            return;
        }
        console.log("creating room");
        this.clearRoom(user1, user2);
        this.clearQueue();
    }
    clearRoom(user1, user2) {
        const roomId = this.generate();
        console.log(roomId);
        this.userDisconnect.set(user1, roomId.toString());
        this.userDisconnect.set(user2, roomId.toString());
        this.room.set(roomId.toString(), {
            user1, user2
        });
        console.log(roomId, user1.city);
        console.log(roomId, user2.city);
        user1.socket.emit('room', {
            room: roomId,
            name: user2.name,
            city: user2.city,
            type: 'offer'
        });
        user2.socket.emit('room', {
            room: roomId,
            name: user1.name,
            city: user1.city,
            type: 'answer'
        });
    }
    handleQuery(socket) {
        socket.on('msg', ({ data }) => {
            var _a;
            console.log(data);
            const roomId = (_a = data === null || data === void 0 ? void 0 : data.room) === null || _a === void 0 ? void 0 : _a.toString();
            const room = this.room.get(roomId);
            const user = (room === null || room === void 0 ? void 0 : room.user1.socket.id) === socket.id ? room.user2 : room === null || room === void 0 ? void 0 : room.user1;
            user === null || user === void 0 ? void 0 : user.socket.emit('receive', { data });
        });
        socket.on('reset', (data) => {
            //console.log(data,'roomreset');
            const roomId = data === null || data === void 0 ? void 0 : data.toString();
            const room = this.room.get(roomId);
            const user = (room === null || room === void 0 ? void 0 : room.user1.socket.id) === socket.id ? room.user2 : room === null || room === void 0 ? void 0 : room.user1;
            user === null || user === void 0 ? void 0 : user.socket.emit('doreset');
        });
        socket.on('chat', ({ chat, room }) => {
            //  console.log(chat,rooom)
            const roomId = room === null || room === void 0 ? void 0 : room.toString();
            const rooom = this.room.get(roomId);
            const user = (rooom === null || rooom === void 0 ? void 0 : rooom.user1.socket.id) === socket.id ? rooom.user2 : rooom === null || rooom === void 0 ? void 0 : rooom.user1;
            user === null || user === void 0 ? void 0 : user.socket.emit('receiveChat', chat);
        });
        socket.on('mouse', ({ x, y, room }) => {
            const roomId = room === null || room === void 0 ? void 0 : room.toString();
            const rooom = this.room.get(roomId);
            const user = (rooom === null || rooom === void 0 ? void 0 : rooom.user1.socket.id) === socket.id ? rooom.user2 : rooom === null || rooom === void 0 ? void 0 : rooom.user1;
            user === null || user === void 0 ? void 0 : user.socket.emit('mouse_point_receive', { x, y });
        });
        socket.on('offer', ({ sdp, room }) => {
            const roomId = room === null || room === void 0 ? void 0 : room.toString();
            const rooom = this.room.get(roomId);
            const user = (rooom === null || rooom === void 0 ? void 0 : rooom.user1.socket.id) === socket.id ? rooom.user2 : rooom === null || rooom === void 0 ? void 0 : rooom.user1;
            user === null || user === void 0 ? void 0 : user.socket.emit('answer', { sdp });
        });
        socket.on('answer-client', ({ room, answer }) => {
            // client-answer
            console.log(room, answer);
            const roomId = room === null || room === void 0 ? void 0 : room.toString();
            const rooom = this.room.get(roomId);
            const user = (rooom === null || rooom === void 0 ? void 0 : rooom.user1.socket.id) === socket.id ? rooom.user2 : rooom === null || rooom === void 0 ? void 0 : rooom.user1;
            user === null || user === void 0 ? void 0 : user.socket.emit('client-answer', { answer });
        });
        socket.on("add-ice-candidate", ({ candidate, room }) => {
            const roomId = room === null || room === void 0 ? void 0 : room.toString();
            const rooom = this.room.get(roomId);
            const user = (rooom === null || rooom === void 0 ? void 0 : rooom.user1.socket.id) === socket.id ? rooom.user2 : rooom === null || rooom === void 0 ? void 0 : rooom.user1;
            user === null || user === void 0 ? void 0 : user.socket.emit('ice-candicate', { candidate });
            // this.onIceCandidates(roomId, socket.id, candidate, type);
        });
        // socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
        //     this.onOffer(roomId, sdp, socket.id);
        // })
        // socket.on("answer",({sdp, roomId}: {sdp: string, roomId: string}) => {
        //     this.onAnswer(roomId, sdp, socket.id);
        // })
    }
    onOffer(roomId, sdp, senderSocketid) {
        const room = this.room.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    onAnswer(roomId, sdp, senderSocketid) {
        const room = this.room.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId
        });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.room.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({ candidate, type }));
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.default = Users;
