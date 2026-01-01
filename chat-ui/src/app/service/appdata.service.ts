import {Injectable}   from '@angular/core';
import {LocalStorage} from 'ngx-webstorage';

@Injectable({ providedIn: 'root' })
export class AppDataService {
  
  @LocalStorage()
  public userId: number = 0;

  @LocalStorage()
  public userName: string = '';

  public clearData(){
    this.userId = 0;
    this.userName = '';
  }

}