import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../Room';
import { Message } from '../Message';
import { User } from '../User';

const URL = "http://localhost:8081/api/rooms";
@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Room>{
    return this.httpClient.get<Room>(URL);
  }

  saveRoom(data: Room): Observable<Room>{
    return this.httpClient.post<Room>(URL, data);
  }

  getRoomById(id: string): Observable<Room>{
    console.log(`${URL}/${id}`);
    
    return this.httpClient.get<Room>(`${URL}/${id}`);
  }

  updateRoomMessages(id: string, message: Message): Observable<Room>{
    return this.httpClient.put<Room>(`${URL}/update-messages/${id}`, message);
  }

  updateUsers(id: string, user: User){
    return this.httpClient.put<Room>(`${URL}/update-users/${id}`, user);
  }

  sendFileMessage( id: string, imageFormData:  FormData){
   return this.httpClient.put<Room>(`${URL}/update-messages-files/${id}`, imageFormData, {observe: "response"});
  }

  editMessage(roomId: string, messageId: string, message: Message){
    return this.httpClient.put<Room>(`${URL}/edit-message/${roomId}/${messageId}`, message);
  }

  deleteRoomById(id: string): Observable<Room>{
    return this.httpClient.delete<Room>(`${URL}/${id}`);
  }

  deleteAllRooms(): Observable<Room>{
    return this.httpClient.delete<Room>(URL);
  }
}
