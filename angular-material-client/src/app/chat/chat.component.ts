import { Component, HostListener, OnInit } from '@angular/core';
import { Message } from '../data/message';
import { AppDataService } from '../service/app-data.service';
import { WebsocketService } from '../service/websocket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.sass']
})
export class ChatComponent implements OnInit {

  currentMessage = ''

  loggedInUser: string | null;
  websocket: WebSocket;

  constructor(private appDataService: AppDataService,
    private websocketService: WebsocketService) {
    this.loggedInUser = this.appDataService.getData("userName");
    this.websocket = this.websocketService.createNew();
    this.websocket.onopen = (event: Event) => {
      let message: Message = {
        type: 'JOINED',
        from: Number(this.appDataService.getData("userId")),
        fromUserName: this.appDataService.getData("userName")!,
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
      from: Number(this.appDataService.getData("userId")),
      fromUserName: this.appDataService.getData("userName")!,
      message: ''
    }
    this.websocket.send(JSON.stringify(message));
  }
  
  ngOnInit(): void {
  }

}
