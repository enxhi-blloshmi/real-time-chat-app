import { Message } from "./Message";
import { User } from "./User";

export class Room{
    roomId!: string;
    roomName!: string;
    messages!: Message[];
    users!: User[];
    
}