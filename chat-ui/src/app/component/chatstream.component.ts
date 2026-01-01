import {Component, EventEmitter, 
  Input, OnChanges, 
  Output, SimpleChanges}            from '@angular/core';
import {Message}                    from '../data/message';
import {AppDataService}             from '../service/appdata.service';
import {WebSocketService}           from '../service/websocket.service';

@Component({
  selector: 'chat-stream',
  templateUrl: '../template/chatstream.component.html',
  standalone: false,
  styleUrls: ['../style/chatstream.component.css']
})
export class ChatStreamComponent implements OnChanges {

  @Input()
  inputMessage = ''

  @Output()
  outputMessage = new EventEmitter<string>();

  message: string = ''; 
  publishedMessage: Message[] = new Array();
  showTypingIndicator: boolean = false;
  typingUser: string = '';
  loggedinUserId: number;

  constructor(private appDataService: AppDataService,
              private websocketService: WebSocketService) {
    this.loggedinUserId = this.appDataService.userId;
  }

  sendTypeIndicator() {
    let message: Message = {
      type: 'TYPING',
      from: this.appDataService.userId,
      fromUserName: this.appDataService.userName,
      message: ''
    }
    this.outputMessage.emit(JSON.stringify(message));
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
    this.outputMessage.emit(JSON.stringify(message));
    this.message = '';
  }

  showUserTypingIndicator(userName: string) {
    this.typingUser = userName;
    this.showTypingIndicator = true;
    setTimeout(() => {
      this.hideUserTypingIndicator();
    }, 1000);
  }

  hideUserTypingIndicator() {
    if (this.showTypingIndicator) {
      this.showTypingIndicator = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const chng = changes['inputMessage'];
    let message: Message = JSON.parse(chng.currentValue);
    if (message.type == 'MESSAGE') {
      this.publishedMessage.push(message);
    } else if (message.type == 'TYPING') {
      if (message.from != this.loggedinUserId) {
        this.showUserTypingIndicator(message.fromUserName);
      }
    }
  }

}