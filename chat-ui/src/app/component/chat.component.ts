import { Component, HostListener, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  isOnline: boolean = false;
  private sub?: Subscription;
  private disconnected: boolean = false;
  showUserMenu: boolean = false;
  @ViewChild('userMenu', { static: false }) userMenuRef?: ElementRef;

  constructor(private appDataService: AppDataService,
    private websocketService: WebSocketService,
    private router: Router) {
    this.loggedInUser = appDataService.userName;
    // connect to websocket service (it manages queue and open event)
    this.websocketService.connect();
  }

  toggleUserMenu(ev?: Event) {
    ev?.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(e: MouseEvent) {
    if (!this.showUserMenu) return;
    const target = e.target as Node;
    if (this.userMenuRef && this.userMenuRef.nativeElement && !this.userMenuRef.nativeElement.contains(target)) {
      this.showUserMenu = false;
    }
  }

  logout(ev?: Event) {
    ev?.stopPropagation();
    if (this.disconnected) return;
    this.disconnected = true;

    const message: Message = {
      type: 'LEFT',
      from: this.appDataService.userId,
      fromUserName: this.appDataService.userName,
      message: ''
    };
    try { this.websocketService.send(JSON.stringify(message)); } catch (e) { }
    try { this.websocketService.close(); } catch (e) { }

    // clear local data
    try { this.appDataService.clearData(); } catch (e) { }

    this.showUserMenu = false;
    // navigate back to login
    try { this.router.navigate(['/login']); } catch (e) { }
  }

  ngOnInit() {
    // send JOINED when socket is open
    this.sub = this.websocketService.onOpen$.subscribe(() => {
      this.isOnline = true;
      const message: Message = {
        type: 'JOINED',
        from: this.appDataService.userId,
        fromUserName: this.appDataService.userName,
        message: ''
      };
      this.websocketService.send(JSON.stringify(message));
    });
  }

  getAvatarUrl(): string {
    const name = this.appDataService.userName || '';
    return '/images/users/' + encodeURIComponent(name) + '.png';
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
    if (this.disconnected) return;
    this.disconnected = true;

    const message: Message = {
      type: 'LEFT',
      from: this.appDataService.userId,
      fromUserName: this.appDataService.userName,
      message: ''
    };
    try {
      // attempt to send a final LEFT message
      this.websocketService.send(JSON.stringify(message));
    } catch (e) {
      // ignore send errors during unload
    }
    // ensure socket is closed
    try { this.websocketService.close(); } catch (e) { }
  }

  // also handle pagehide (mobile browsers) and visibilitychange as a fallback
  @HostListener('window:pagehide')
  onPageHide() {
    this.close();
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.close();
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

}