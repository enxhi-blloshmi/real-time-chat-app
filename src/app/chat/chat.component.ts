import { Component, OnInit } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client'
import { RoomService } from '../services/room.service';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../Message';
import { Room } from '../Room';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private stompClient!: any;

  rooms: Room[]=[];
  roomToBeDisplayed!:Room;
  name!: string;
  messages: Message[] = [];
  newmessage!: any;
  newRoom: Room = new Room;
  newRoomName!: string;
  constructor(private roomService: RoomService, 
    private activatedRoute: ActivatedRoute) {}

  ngOnInit(){
    this.activatedRoute.queryParams.subscribe((params:any)=> {
      this.name=params.name;
    })
    this.connect();
    this.getRooms();
  }

  //stomp 
  connect() {
    const socket = new SockJS('http://localhost:8080/testchat');
    this.stompClient = Stomp.over(socket);

    //connect(headers, connectCallback)
    this.stompClient.connect({}, ()=>{
      //console.log('Connected: ' +frames);
      this.stompClient.subscribe('/start/chat', (messageSent: any)=>{
        this.showMessage(JSON.parse(messageSent.body))
      });
    });
  }

  getRooms(){
    this.roomService.getAll().subscribe((data: any)=>{
      //data[0] mban roomin kryesor per shkembimin e mesazheve
      if(!this.roomToBeDisplayed){
      this.roomToBeDisplayed=data[0];
      this.messages=this.roomToBeDisplayed.messages;}

      data.forEach((room: any) => {
        this.rooms.push(room);
      });
    });
  }

  sendMessage(){
    //send(destination, header={}, body = " ")
    console.log(JSON.stringify(this.newmessage));
    
    this.stompClient.send('/current/chat', {}, JSON.stringify(this.newmessage));

    //update i mesazheve ne databaze
    var msg: Message=new Message;
    msg.userMessage=this.newmessage;
    msg.userName=this.name;
    this.roomService.updateRoomMessages(this.roomToBeDisplayed.roomId, msg).subscribe({
      next: (res) =>{
      },
       error:() =>{
         alert("Error while updating!")
       }
    });
    this.newmessage = "";
  }

  showMessage(message: string){
    var id=this.roomToBeDisplayed.roomId;
    this.roomService.getRoomById(id).subscribe((data:any)=>{
      this.messages=data.messages;
    })
    
    /*var msg2: Message=new Message;
    msg2.userMessage= message;
    msg2.userName=this.name;

    this.messages.push(msg2);*/ 
  }

  createNewRoom(){
    this.newRoom.roomName=this.newRoomName;
    
    this.roomService.saveRoom(this.newRoom).subscribe({
      next: (res) =>{
      },
       error:() =>{
         alert("Error while saving!")
       }
    });

    this.refresh();
    this.joinRoom(this.newRoom.roomId);
    
  }

  joinRoom(id: string){
    this.roomService.getRoomById(id).subscribe((room: Room)=>{
      this.roomToBeDisplayed=room;
      this.messages=this.roomToBeDisplayed.messages;
    });
    this.refresh(); 
  }

  refresh(){
    var _rooms: Room[] =new Array();
    this.roomService.getAll().subscribe((data: any)=>{
      data.forEach((room: any) => {
        _rooms.push(room);
      });
    });
    this.rooms=_rooms;
  }

  processFile(event: any){
    const file: File = event.target.files[0];
    if(file)
    {
      this.newmessage=file.name;
      const formData = new FormData();
      formData.append("file", file);
    }
  }
}
/*messages: string[] = [];
  disabled = true;
  newmessage!: string;
  private stompClient!: any;

  

  setConnected(connected: boolean){
    this.disabled = !connected;
    if(connected){
      this.messages=[];
    }
  }

  connect() {
    const socket = new SockJS('http://localhost:8080/testchat');
    this.stompClient = Stomp.over(socket);
    //const _this=this;

    //connect(headers, connectCallback)
    this.stompClient.connect({}, ()=>{
      //console.log('Connected: ' +frame);
      this.stompClient.subscribe('/start/initial', (messageSent: any)=>{
       //console.log(JSON.parse(textSent.body));
        this.showMessage(JSON.parse(messageSent.body))
        
      });
      
    });
    
  }

  sendMessage(){
    //send(destination, header={}, body = " ")
    this.stompClient.send(
      '/current/resume',
      {},
      JSON.stringify(this.newmessage)
    );

    this.newmessage = "";
  }

  showMessage(message: string){
    this.messages.push(message);
  }*/