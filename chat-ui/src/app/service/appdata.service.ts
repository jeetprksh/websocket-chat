import { Injectable } from '@angular/core';

const KEY_USER_ID = 'chat.userId';
const KEY_USER_NAME = 'chat.userName';

@Injectable({ providedIn: 'root' })
export class AppDataService {

  private _userId: number = 0;
  private _userName: string = '';

  constructor() {
    // load persisted values from localStorage if present
    try {
      const id = localStorage.getItem(KEY_USER_ID);
      const name = localStorage.getItem(KEY_USER_NAME);
      if (id !== null) this._userId = parseInt(id, 10) || 0;
      if (name !== null) this._userName = name;
    } catch (e) {
      // ignore storage errors (e.g., private mode)
    }
  }

  get userId(): number {
    return this._userId;
  }

  set userId(v: number) {
    this._userId = v || 0;
    try {
      if (this._userId && this._userId > 0) {
        localStorage.setItem(KEY_USER_ID, String(this._userId));
      } else {
        localStorage.removeItem(KEY_USER_ID);
      }
    } catch (e) {
      // ignore
    }
  }

  get userName(): string {
    return this._userName;
  }

  set userName(v: string) {
    this._userName = v || '';
    try {
      if (this._userName && this._userName.length) {
        localStorage.setItem(KEY_USER_NAME, this._userName);
      } else {
        localStorage.removeItem(KEY_USER_NAME);
      }
    } catch (e) {
      // ignore
    }
  }

  public clearData() {
    this._userId = 0;
    this._userName = '';
    try {
      localStorage.removeItem(KEY_USER_ID);
      localStorage.removeItem(KEY_USER_NAME);
    } catch (e) {
      // ignore
    }
  }

}