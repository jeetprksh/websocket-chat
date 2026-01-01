import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message } from '../data/message';
import { AppDataService } from '../service/appdata.service';
import { WebSocketService } from '../service/websocket.service';

@Component({
  selector: 'chat',
  templateUrl: '../template/chat.component.html',
  standalone: false,
  styleUrls: ['../style/chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  loggedInUser: String;
  private sub?: Subscription;

  constructor(private appDataService: AppDataService,
    private websocketService: WebSocketService) {
    this.loggedInUser = appDataService.userName;
    // connect to websocket service (it manages queue and open event)
    this.websocketService.connect();
  }

  ngOnInit() {
    // send JOINED when socket is open
    this.sub = this.websocketService.onOpen$.subscribe(() => {
      const message: Message = {
        type: 'JOINED',
        from: this.appDataService.userId,
        fromUserName: this.appDataService.userName,
        message: ''
      };
      this.websocketService.send(JSON.stringify(message));
    });
  }

  sendMessage(msg: string) {
    if (msg == '' || msg == undefined) return;
    this.websocketService.send(msg);
  }

  private doLogout() {

  }

  // no longer needed — chat-stream now sends directly through WebSocketService
  recieveMessage(message: string) {
    this.sendMessage(message)
  }

  @HostListener('window:beforeunload')
  close() {
    const message: Message = {
      type: 'LEFT',
      from: this.appDataService.userId,
      fromUserName: this.appDataService.userName,
      message: ''
    };
    this.websocketService.send(JSON.stringify(message));
    this.websocketService.close();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}