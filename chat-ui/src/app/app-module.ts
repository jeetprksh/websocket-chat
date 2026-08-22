import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './login/login.component';
import { ChatComponent } from './chat/chat.component';
import { UsersComponent } from './chat/users.component';
import { ChatStreamComponent } from './chat/chatstream.component';
import { provideNgxWebstorage, withLocalStorage } from 'ngx-webstorage';
import { AppService } from './core/app.service';
import { AppDataService } from './core/appdata.service';
import { WebSocketService } from './chat/websocket.service';
import { XHRHandler } from './core/xhrhandler.service';

@NgModule({
  declarations: [
    App,
    LoginComponent,
    ChatComponent,
    UsersComponent,
    ChatStreamComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideNgxWebstorage(withLocalStorage()),
    provideBrowserGlobalErrorListeners(),
    AppService,
    XHRHandler,
    AppDataService,
    WebSocketService
  ],
  bootstrap: [App]
})
export class AppModule { }
