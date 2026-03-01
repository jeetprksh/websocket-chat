import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../service/app.service';
import { User } from '../data/user';
import { Message } from '../data/message';
import { WebSocketService } from '../service/websocket.service';

@Component({
  selector: 'users',
  templateUrl: '../template/users.component.html',
  standalone: false,
  styleUrls: ['../style/user.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {

  users: User[] = new Array();
  private sub?: Subscription;
  private openSub?: Subscription;

  constructor(private appService: AppService,
    private websocketService: WebSocketService,
    private cd: ChangeDetectorRef) {
  }

  getAvatarUrl(user: User): string {
    const name = (user && user.userName) ? String(user.userName) : '';
    return '/images/users/' + encodeURIComponent(name) + '.png';
  }

  ngOnInit(): void {
    // load user list when websocket connection is established
    this.openSub = this.websocketService.onOpen$.subscribe(() => {
      this.initUserList();
    });

    this.sub = this.websocketService.messages$.subscribe((message: Message) => {
      if (message.type == 'JOINED') {
        this.setUserStatus(message.from, true);
      } else if (message.type == 'LEFT') {
        this.setUserStatus(message.from, false);
      }
      // mark for check instead of forcing change detection
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.openSub?.unsubscribe();
  }

  initUserList() {
    this.appService.listUser().subscribe(response => {
      this.users = response;
      this.cd.markForCheck();
    });
  }

  setUserStatus(userId: Number, isOnline: boolean) {
    const user = this.users.find(u => u.id == userId);
    if (user) {
      user.online = isOnline;
    }
  }

}