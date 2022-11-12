import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  addressForm = this.fb.group({
    name: [null, Validators.required]
  });

  constructor(private fb: FormBuilder) {

  }

  onSubmit(): void {
    console.log('Thanks! ' + this.addressForm.controls.name.value);
  }
}
