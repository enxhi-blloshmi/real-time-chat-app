import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client'
import { RoomService } from '../services/room.service';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../Message';
import { Room } from '../Room';
import { User } from '../User';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements AfterViewChecked,OnInit {

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  private stompClient!: any;

  rooms: Room[]=[];
  roomToBeDisplayed!:Room;
  name!: string;
  messages: any[] = [];
  users: User[] = [];
  newmessage!: any;
  newRoom: Room = new Room;
  newRoomName!: string;
  edit: boolean = false;
  editedMessage! : Message;
  image!: boolean;
  
  constructor(private roomService: RoomService, 
    private activatedRoute: ActivatedRoute) {}

  ngOnInit(){
    this.connect();
    this.getRooms();
    this.activatedRoute.queryParams.subscribe((params:any)=> {
      this.name = params.name;  
    });
    this.scrollToBottom();
  }

  /**
   * Funksioni qe ben lidhjen me socket e serverit
   */
  connect() {
    const socket = new SockJS('http://localhost:8081/testchat');
    this.stompClient = Stomp.over(socket);

    //connect(headers, connectCallback)
    this.stompClient.connect({}, ()=>{
      //console.log('Connected: ' +frames);
      this.stompClient.subscribe('/start/chat', (messageSent: any)=>{
        this.showMessage();
        
      });
    });
  }

  /**
   * Merr te gjitha te room-et nga databaza
   */
  getRooms(){
    this.roomService.getAll().subscribe((data: any)=>{
     
      //data[0] mban roomin global per shkembimin e mesazheve
      if(!this.roomToBeDisplayed){
      this.roomToBeDisplayed = data[0]; 

      if(this.roomToBeDisplayed.messages!=null)
      this.roomToBeDisplayed.messages.forEach((element:any) => {
        if(element.type == "file")
        {
          this.image = true;
          element.image = 'data:image/jpeg;base64,'+ element.image;
        }
        this.image=false;
      });

      this.messages = this.roomToBeDisplayed.messages;
      this.users = this.roomToBeDisplayed.users;
    }

    var _rooms: Room[] = new Array();
    this.roomService.getAll().subscribe((data: any)=>{
      data.forEach((room: any) => {
        _rooms.push(room);
      });
    });
    this.rooms = _rooms;
    });
  }

  /**
   * Funksioni qe dergon mesazhin 
   */
  sendMessage(){
    
    var msg: Message = new Message;
    msg.userMessage = this.newmessage;
    msg.userName = this.name;

    //send(destination, header={}, body = " ")
    this.stompClient.send('/current/chat', {}, JSON.stringify(msg));
    this.roomService.updateRoomMessages(this.roomToBeDisplayed.roomId, msg).subscribe({
      next: (res) =>{
      },
       error:() =>{
         alert("Error while updating!");
       }
    });
    this.newmessage = "";
  }

  /**
   * Shfaq mesazhet ne faqen e aplikacionit
   */
  showMessage(){
    this.roomService.getRoomById(this.roomToBeDisplayed.roomId).subscribe((data:any)=>{
      data.messages.forEach((element:any) => {
        if(element.type == "file")
        {
          this.image = true;
          element.image = 'data:image/jpeg;base64,'+ element.image;
        }
        this.image = false;
      }); 
      this.messages = data.messages;
    })
    
  }

  /**
   * Ben perditesimin e user-ave te room-it
   */
  updateUsers(){

    var u: User = new User();
    u.userName = this.name;

    this.roomService.updateUsers(this.roomToBeDisplayed.roomId, u).subscribe({
      next:(res) => {
    
      }, 
      error: () => {
        alert("Error while updating users !");
      }
    });

  }

  /**
   * Krijon nje room te ri
   */
  createNewRoom(){
    this.newRoom.roomName = this.newRoomName;
    this.roomService.saveRoom(this.newRoom).subscribe({
      next: (res : any) =>{ 
      this.getRooms();
    },
       error:() =>{
         alert("Error while saving!")
       }
    });

    this.newRoomName="";

  }

  /**
   * Shfaq room-in ne te cilin perdoruesi do te behet pjese
   * @param id - id e room-it ne te cilen do behet join
   */
  joinRoom(id: string){
    this.roomService.getRoomById(id).subscribe((room: Room)=>{
      this.roomToBeDisplayed = room;
      
      if(this.roomToBeDisplayed.messages != null){
        this.roomToBeDisplayed.messages.forEach((element:any) => {
          if(element.type == "file")
          {
            this.image = true;
            element.image = 'data:image/jpeg;base64,'+ element.image;
          }
          this.image = false;
        }); 
      }
      this.updateUsers();
      this.messages = this.roomToBeDisplayed.messages;
    });
  }

 /**
  * Dergon imazhin 
  * @param event - eventi qe triger-ohet kur shtohet file ne input
  */
  processImage(event: any){
    const file: File = event.target.files[0];
    if(file)
    {
      
    const formData = new FormData();
      
    formData.append('image', file, file.name);
    formData.append('userName', this.name);
    this.roomService.sendFileMessage(this.roomToBeDisplayed.roomId, formData).subscribe({
      next: (res) => {
      },
       error:() => {
         alert("Error while updating !");
       }
    });
      
    }
  }

  /**
   * Ben edit mesazhin 
   * @param message - mesazhi qe do editohet
   */
  editMessage(message: any){
    if(this.name == message.userName && message.type == "text"){
      this.editedMessage = message;
      this.edit = true;
      this.newmessage = message.userMessage;
    }
  }

  /**
   * Dergon mesazhin per perditesim ne databaze
   */
  sendEditedMessage(){
    this.editedMessage.userMessage = this.newmessage;
    this.roomService.editMessage(this.roomToBeDisplayed.roomId, this.editedMessage.id, this.editedMessage).subscribe({
      next: (res) => {
      },
       error:() => {
         alert("Error while updating!")
       }
    });
    this.edit = false;
    this.newmessage = "";
  }
isMe(name: string){
  return this.name==name;
}
  ngAfterViewChecked() {
    console.log('123');
    
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log('Scroll to bottom failed');
    }
  }
}