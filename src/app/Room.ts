import { Message } from "./Message";
import { User } from "./User";

export class Room{
    roomId!: string;
    roomName!: string;
    messages!: Message[];
    users!: User[];

    public get getId():string{
        return this.roomId;
    }
    public get getName():string{
        return this.roomName;
    }
    public get getMessages():Message[]{
        return this.messages;
    }
    public get getUsers():User[]{
        return this.users;
    }

    public set setId(val: string){
        this.roomId=val;
    }
    public set setName(val: string){
        this.roomName=val;
    }
    public set setMessages(val: Message[]){
        this.messages=val;
    }
    public set setUsers(val: User[]){
        this.users=val;
    }
    
}