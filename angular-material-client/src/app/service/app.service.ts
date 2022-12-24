import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest } from '../data/loginrequest';
import { XhrhandlerService } from './xhrhandler.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private xhrhandler: XhrhandlerService) {}

  userLogin(request: LoginRequest): Observable<any> {
    console.log("request :: " + request)
    return this.xhrhandler.doPost('user/login', request);
  }

  listUser(): Observable<any> {
    return this.xhrhandler.doGet('user/list');
  }
}
