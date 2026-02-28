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
  private typingIntervalId: any;
  private lastTypedAt: number = 0;
  private lastSentAt: number = 0;

  getAvatarUrl(userName: string): string {
    return '/images/users/' + encodeURIComponent(userName) + '.png';
  }

  constructor(private appDataService: AppDataService,
              private websocketService: WebSocketService,
              private cd: ChangeDetectorRef) {
    this.loggedinUserId = this.appDataService.userId;
  }

  ngOnInit(): void {
    this.sub = this.websocketService.messages$.subscribe((message: Message) => {
      if (message.type == 'MESSAGE') {
        // avoid duplicate when server echoes user's own optimistic message
        const duplicate = this.publishedMessage.some(m => m.from === message.from && m.message === message.message);
        if (!duplicate) {
          this.publishedMessage.push(message);
        }
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
    if (this.typingIntervalId) {
      clearInterval(this.typingIntervalId);
      this.typingIntervalId = undefined;
    }
  }

  // Called on input events; throttle actual websocket sends so we don't send per-character
  onTypingInput() {
    this.lastTypedAt = Date.now();

    // send immediately if nothing is already sending
    if (!this.typingIntervalId) {
      this.sendTypingIndicatorNow();

      // start interval that will send every 900ms while the user keeps typing
      this.typingIntervalId = setInterval(() => {
        const now = Date.now();
        // if user typed within the last 900ms, send another typing indicator
        if (now - this.lastTypedAt < 900) {
          this.sendTypingIndicatorNow();
        } else {
          // stop the interval when user stopped typing
          clearInterval(this.typingIntervalId);
          this.typingIntervalId = undefined;
        }
      }, 900);
    }
  }

  // Auto-resize the textarea up to 3 lines, then allow scrolling
  adjustTextarea(target: any) {
    try {
      const el = target as HTMLTextAreaElement;
      if (!el) return;
      el.style.height = 'auto';
      const cs = window.getComputedStyle(el);
      const lineHeight = parseFloat(cs.lineHeight || '20') || 20;
      const paddingTop = parseFloat(cs.paddingTop || '10') || 10;
      const paddingBottom = parseFloat(cs.paddingBottom || '10') || 10;
      const maxHeight = lineHeight * 3 + paddingTop + paddingBottom;
      const newHeight = Math.min(el.scrollHeight, maxHeight);
      el.style.height = newHeight + 'px';
    } catch (e) {
      // ignore
    }
  }

  onTextareaKeydown(e: KeyboardEvent) {
    // Enter submits, Shift+Enter inserts newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
      // reset textarea height after send
      setTimeout(() => {
        const ta = document.querySelector('.message-form textarea') as HTMLTextAreaElement | null;
        if (ta) ta.style.height = '';
      }, 0);
    }
  }

  private sendTypingIndicatorNow() {
    const now = Date.now();
    // avoid sending too frequently (safety guard)
    if (now - this.lastSentAt < 300) return;
    this.lastSentAt = now;

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

    // optimistic update so message appears immediately
    this.publishedMessage.push(message);
    this.cd.detectChanges();

    // send to server
    this.websocketService.send(JSON.stringify(message));

    // clear input
    this.message = '';
    // also clear textarea height if present
    setTimeout(() => {
      const ta = document.querySelector('.message-form textarea') as HTMLTextAreaElement | null;
      if (ta) ta.style.height = '';
    }, 0);
  }

  private typingTimer: any;

  showUserTypingIndicator(userName: string) {
    this.typingUser = userName;
    this.showTypingIndicator = true;
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    // hide after 1 second; if another typing indicator arrives before 0.9s,
    // this timeout will be cleared and restarted which extends visibility
    this.typingTimer = setTimeout(() => {
      this.hideUserTypingIndicator();
      this.cd.detectChanges();
    }, 1000);
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