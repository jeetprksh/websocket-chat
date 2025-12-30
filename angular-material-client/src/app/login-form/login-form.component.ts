import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppDataService } from '../service/app-data.service';
import { AppService } from '../service/app.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {

  loginForm = this.fb.group({
    name: ['', Validators.required]
  });

  constructor(private fb: FormBuilder,
    private router: Router,
    private appService: AppService,
    private appDataService: AppDataService) { }

  onSubmit(): void {
    console.log('Thanks! ' + this.loginForm.controls.name.value);
    this.appService.userLogin({name: this.loginForm.controls.name.value})
        .subscribe(response => {
          this.appDataService.saveData("userId",response.id);
          this.appDataService.saveData("userName", response.userName);
          this.router.navigate(['/chat']);
        });
  }
}
