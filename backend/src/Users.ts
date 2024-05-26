import { Socket } from "socket.io";


let GLOBAL_ROOM_ID = 1;

interface User{
    name:string |undefined,
    socket:Socket,
    city:string| undefined,
}
interface Room{
    user1:User,
    user2:User
}

 export default class Users {
    private userDisconnect :Map<User| undefined,string>;
    private  room : Map<string | undefined,Room>;
    private  user : User[];
    private queue : string[];

    constructor(){
        this.room = new Map<string|undefined,Room>;
        this.user = [];
        this.queue = [];
        this.userDisconnect = new Map<User| undefined,string>;
    }

    createUser(socket:Socket,name:string,city:string){
        console.log(`user connected ${socket.id}`);
        this.user.push({
            name,socket,city
        });
        this.queue.push(socket.id);
        this.clearQueue();
        this.handleQuery(socket);
    }

    removeUser(socket:string){
        const user = this.user.find(x=>x.socket.id===socket);
      //  const data = this.room.filter(([k,v])=>v===user)
        const roomId = this.userDisconnect.get(user);
        const room = this.room.get(roomId);
        if(room !== undefined){
            const userF = room.user1 === user ? room.user2: room.user1;
            userF.socket.emit('userdisconnected',
                'user got disconnected'
            )
        }
        this.user = this.user.filter(x=>x.socket.id !== socket);
        this.queue = this.queue.filter(x=>x !== socket);
    }

    clearQueue(){
       // console.log(this.queue.length);
        if(this.queue.length < 2){
            return;
        }
        this.user.forEach(x=>{
            console.log(x.socket.id);
        })
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
      //  console.log(id1,id2);

        const user1 = this.user.find(x=>x.socket.id === id1);
        const user2 = this.user.find(x=>x.socket.id === id2);
       
        if(!user1 || !user2){
            return;
        }
        console.log("creating room");
        this.clearRoom(user1,user2);
        this.clearQueue();
    }

    clearRoom(user1:User,user2:User){
            const roomId =this.generate();
            console.log(roomId);
            this.userDisconnect.set(user1,roomId.toString());
            this.userDisconnect.set(user2,roomId.toString());
             this.room.set(roomId.toString(),{
                user1,user2
            });
            console.log(roomId,user1.city);
            console.log(roomId,user2.city);
           
            user1.socket.emit('room',
            {
                room:roomId,
                name:user2.name,
                city:user2.city,
            }
            )
            user2.socket.emit('room',
            {
                room:roomId,
                name:user1.name,
                city:user1.city,
            }
            )
            
    }
    
    handleQuery(socket:Socket){
            socket.on('msg',({data})=>{
                console.log(data);
                const roomId = data?.room?.toString();
                const room = this.room.get(roomId);
                const user = room?.user1.socket.id === socket.id ? room.user2 :room?.user1;
                user?.socket.emit('receive',{data}); 
               
            });
            socket.on('reset',(data)=>{
                //console.log(data,'roomreset');
                const roomId = data?.toString();
                const room = this.room.get(roomId);
                const user = room?.user1.socket.id === socket.id ? room.user2 :room?.user1;
                user?.socket.emit('doreset'); 
            });
            socket.on('chat',({chat,room})=>{
              //  console.log(chat,rooom)
                const roomId = room?.toString();
                const rooom = this.room.get(roomId);
                const user = rooom?.user1.socket.id === socket.id ? rooom.user2 :rooom?.user1;
                user?.socket.emit('receiveChat',chat);
            });
            socket.on('mouse',({x,y,room})=>{
                const roomId = room?.toString();
                const rooom = this.room.get(roomId);
                const user = rooom?.user1.socket.id === socket.id ? rooom.user2 :rooom?.user1;
                user?.socket.emit('mouse_point_receive',{x,y});
            })
    }

    generate(){
        return GLOBAL_ROOM_ID++;
    }

}