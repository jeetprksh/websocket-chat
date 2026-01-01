import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message } from '../data/message';
import { AppDataService } from '../service/appdata.service';
import { WebSocketService } from '../service/websocket.service';

@Component({
  selector: 'chat-stream',
  templateUrl: '../template/chatstream.component.html',
  standalone: false,
  styleUrls: ['../style/chatstream.component.css']
})
export class ChatStreamComponent implements OnInit, OnDestroy {

  message: string = '';
  publishedMessage: Message[] = new Array();
  showTypingIndicator: boolean = false;
  typingUser: string = '';
  loggedinUserId: number;
  private sub?: Subscription;

  constructor(private appDataService: AppDataService,
              private websocketService: WebSocketService,
              private cd: ChangeDetectorRef) {
    this.loggedinUserId = this.appDataService.userId;
  }

  ngOnInit(): void {
    this.sub = this.websocketService.messages$.subscribe((message: Message) => {
      if (message.type == 'MESSAGE') {
        this.publishedMessage.push(message);
      } else if (message.type == 'TYPING') {
        if (message.from != this.loggedinUserId) {
          this.showUserTypingIndicator(message.fromUserName);
        }
      }
      this.cd.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  sendTypeIndicator() {
    let message: Message = {
      type: 'TYPING',
      from: this.appDataService.userId,
      fromUserName: this.appDataService.userName,
      message: ''
    }
    this.websocketService.send(JSON.stringify(message));
  }

  sendMessage() {
    let msg = this.message;
    if (msg == '' || msg == undefined) return;

    let message: Message = {
      type: 'MESSAGE',
      from: this.appDataService.userId,
      fromUserName: this.appDataService.userName,
      message: msg
    }
    this.websocketService.send(JSON.stringify(message));
    this.message = '';
  }

  private typingTimer: any;

  showUserTypingIndicator(userName: string) {
    this.typingUser = userName;
    this.showTypingIndicator = true;
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    // hide after 2 seconds — ensure change detection by calling detectChanges in the timeout
    this.typingTimer = setTimeout(() => {
      this.hideUserTypingIndicator();
      this.cd.detectChanges();
    }, 2000);
  }

  hideUserTypingIndicator() {
    if (this.showTypingIndicator) {
      this.showTypingIndicator = false;
    }
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = undefined;
    }
  }

}