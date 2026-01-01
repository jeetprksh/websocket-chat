import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Message } from '../data/message';

// Build a websocket URL based on the browser hostname so it works when served from a container
const WEBSOCKET_URL = `ws://${window.location.hostname}:8185/websocket`;

@Injectable()
export class WebSocketService {

  private websocket!: WebSocket;
  private messageSubject = new Subject<Message>();
  /** Stream of parsed messages from server */
  messages$: Observable<Message> = this.messageSubject.asObservable();

  private openSubject = new Subject<void>();
  onOpen$ = this.openSubject.asObservable();

  private queuedSends: string[] = [];

  constructor(private ngZone: NgZone) { }

  connect(): void {
    this.websocket = new WebSocket(WEBSOCKET_URL);

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
