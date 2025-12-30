import {BrowserModule}        from '@angular/platform-browser';
import {NgModule}             from '@angular/core';
import {FormsModule}          from '@angular/forms';
import {HttpClientModule}     from '@angular/common/http';
import {RouterModule}         from '@angular/router';
import {NgxWebstorageModule}  from 'ngx-webstorage';

import {AppComponent}         from './component/app.component';
import {LoginComponent}       from './component/login.component';
import {ChatComponent}        from './component/chat.component';
import {ChatStreamComponent}  from './component/chatstream.component';
import {UsersComponent}       from './component/users.component';

import {AppService}           from './service/app.service';
import {XHRHandler}           from './service/xhrhandler.service';
import {AppDataService}       from './service/appdata.service';
import {WebSocketService}     from './service/websocket.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ChatComponent,
    ChatStreamComponent,
    UsersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule, 
    NgxWebstorageModule.forRoot(),
    RouterModule.forRoot([
      {path: '', redirectTo: '/login', pathMatch: 'full'},
      {path: 'login', component: LoginComponent},
      {path: 'chat', component: ChatComponent}
    ])
  ],
  providers: [AppService, XHRHandler, AppDataService, WebSocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
