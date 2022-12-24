import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HeaderService } from './header.service';

const SERVER_BASE_URL = "http://localhost:8185/";

@Injectable({
  providedIn: 'root'
})
export class XhrhandlerService {

  constructor(private httpClient: HttpClient) { }

  doGet(path : string) {
    return this.httpClient.get(SERVER_BASE_URL + path);
  }

  doPost(path : string, reqData : any) {
    return this.httpClient.post(SERVER_BASE_URL + path, JSON.stringify(reqData), {headers: HeaderService.getCommonHeaders()});
  }

}
