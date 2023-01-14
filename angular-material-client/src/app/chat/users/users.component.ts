import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Message } from 'src/app/data/message';
import { User } from 'src/app/data/user';
import { AppService } from 'src/app/service/app.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.sass']
})
export class UsersComponent implements OnInit {

  @Input()
  inputMessage = ''

  users: User[] = new Array();

  constructor(private appService: AppService) {
    this.initUserList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const chng = changes['inputMessage'];
    let message: Message = JSON.parse(chng.currentValue);
    if (message.type == 'JOINED') {
      this.setUserStatus(Number(message.from), true);
    } else if (message.type == 'LEFT') {
      this.setUserStatus(Number(message.from), false);
    }
  }

  initUserList() {
    this.appService.listUser().subscribe(response => {
      this.users = response as User[];
    });
  }

  setUserStatus(userId: Number, isOnline: boolean) {
    let user: User = this.users.find(u => u.id == userId)!;
    user.online = isOnline;
  }

  ngOnInit(): void {
  }

}
