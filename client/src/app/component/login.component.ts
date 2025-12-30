import {Component}      from '@angular/core';
import {AppService}     from '../service/app.service';
import {Router}         from '@angular/router';
import {AppDataService} from '../service/appdata.service';

@Component({
  selector: 'login',
  templateUrl: '../template/login.component.html'
})
export class LoginComponent {

  userName: string;
  showErrorMsg: boolean;

  constructor(private router: Router,
              private appService: AppService,
              private appDataService: AppDataService) { }

  doLogin() {
    this.appService.userLogin({name: this.userName})
        .subscribe(response => {
          this.appDataService.userId = response.id;
          this.appDataService.userName = response.userName;
          this.router.navigate(['/chat']);
        });
  }
}