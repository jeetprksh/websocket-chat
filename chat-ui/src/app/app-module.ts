import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { LoginComponent } from './component/login.component';
import { ChatComponent } from './component/chat.component';
import { UsersComponent } from './component/users.component';
import { ChatStreamComponent } from './component/chatstream.component';
import { provideNgxWebstorage, withLocalStorage } from 'ngx-webstorage';
import { AppService } from './service/app.service';
import { AppDataService } from './service/appdata.service';
import { WebSocketService } from './service/websocket.service';
import { XHRHandler } from './service/xhrhandler.service';

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
