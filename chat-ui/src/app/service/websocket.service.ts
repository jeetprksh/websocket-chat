import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Message } from '../data/message';
import { AppDataService } from './appdata.service';

// Build a websocket URL based on the browser hostname so it works when served from a container
// Build a websocket base URL based on the browser hostname so it works when served from a container
const WS_HOST = window.location.hostname;
const WS_PORT = 8185;
const WEBSOCKET_BASE = `ws://${WS_HOST}:${WS_PORT}/websocket`;

@Injectable()
export class WebSocketService {

  private websocket!: WebSocket;
  private messageSubject = new Subject<Message>();
  /** Stream of parsed messages from server */
  messages$: Observable<Message> = this.messageSubject.asObservable();

  private openSubject = new Subject<void>();
  onOpen$ = this.openSubject.asObservable();

  private queuedSends: string[] = [];

  constructor(private ngZone: NgZone,
              private appData: AppDataService) { }

  connect(): void {
    // include user info as query parameters since browser sockets can't set headers
    let url = WEBSOCKET_BASE;
    try {
      const id = encodeURIComponent(String(this.appData.userId || ''));
      const name = encodeURIComponent(this.appData.userName || '');
      url += `?userId=${id}&userName=${name}`;
    } catch (e) {
      // ignore
    }
    this.websocket = new WebSocket(url);

    this.websocket.onopen = () => {
      // Flush queue when socket opens
      while (this.queuedSends.length) {
        const next = this.queuedSends.shift()!;
        this.websocket.send(next);
      }
      this.ngZone.run(() => this.openSubject.next());
      this.openSubject.complete();
    };

    this.websocket.onmessage = (event: MessageEvent) => {
      // parse and emit inside Angular zone so subscribers can run change detection if desired
      try {
        const msg: Message = JSON.parse(event.data);
        this.ngZone.run(() => this.messageSubject.next(msg));
      } catch (err) {
        // non-JSON messages are forwarded as raw text
        this.ngZone.run(() => this.messageSubject.next({ type: 'RAW', from: -1, fromUserName: '', message: String(event.data) }));
      }
    };

    this.websocket.onclose = () => {
      this.ngZone.run(() => this.messageSubject.complete());
    };
  }

  send(payload: string): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(payload);
    } else {
      // queue until open
      this.queuedSends.push(payload);
    }
  }

  close(): void {
    if (this.websocket) {
      this.websocket.close();
    }
  }

}
