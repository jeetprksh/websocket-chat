import {Component, HostListener}  from '@angular/core';
import {Message}                  from '../data/message';
import {AppDataService}           from '../service/appdata.service';
import {WebSocketService}         from '../service/websocket.service';

@Component({
  selector: 'chat',
  templateUrl: '../template/chat.component.html',
  standalone: false,
  styleUrls: ['../style/chat.component.css']
})
export class ChatComponent {

  currentMessage = ''

  loggedInUser: String;
  websocket: WebSocket;

  constructor(private appDataService: AppDataService,
    private websocketService: WebSocketService) {
    this.loggedInUser = appDataService.userName;
    this.websocket = this.websocketService.createNew();
    this.websocket.onopen = (ev: Event) => {
      let message: Message = {
        type: 'JOINED',
        from: this.appDataService.userId,
        fromUserName: this.appDataService.userName,
        message: ''
      }
      this.websocket.send(JSON.stringify(message));
    }
    this.startListening();
  }

  startListening() {
    this.websocket.onmessage = (event: MessageEvent) => {
      this.currentMessage = event.data;
    };
  }

  sendMessage(msg: string) {
    if (msg == '' || msg == undefined) return;
    this.websocket.send(msg);
  }

  private doLogout() {

  }

  recieveMessage(message: string) {
    this.sendMessage(message)
  }

  @HostListener('window:beforeunload')
  close() {
    let message: Message = {
      type: 'LEFT',
      from: this.appDataService.userId,
      fromUserName: this.appDataService.userName,
      message: ''
    }
    this.websocket.send(JSON.stringify(message));
  }

}