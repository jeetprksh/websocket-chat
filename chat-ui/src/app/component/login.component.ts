import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { AppService } from '../service/app.service';
import { Router } from '@angular/router';
import { AppDataService } from '../service/appdata.service';

@Component({
  selector: 'login',
  templateUrl: '../template/login.component.html',
  styleUrls: ['../style/login.component.css'],
  standalone: false,
})
export class LoginComponent implements OnInit, OnDestroy {

  userName: string = '';
  showErrorMsg: boolean = false;

  availableUsers: any[] = [];
  filteredUsers: any[] = [];
  showSuggestions: boolean = false;
  highlightedIndex: number = -1;

  constructor(private router: Router,
              private appService: AppService,
              private appDataService: AppDataService,
              private ngZone: NgZone) { }

  private _onDocClick = (e: Event) => this.onDocumentClick(e);
  private _onResize = () => this.adjustDropdownWidth();

  ngOnInit(): void {
    this.appService.listUser().subscribe((users: any[]) => {
      // only include users that are NOT online (API returns `online`)
      this.availableUsers = (users || []).filter(u => !u.online);
      this.filteredUsers = [...this.availableUsers];
    }, err => {
      console.warn('Failed to load user list', err);
      this.availableUsers = [];
      this.filteredUsers = [];
    });

    // listen for pointer down events outside the typeahead to hide suggestions
    // use mousedown/touchstart so we catch the event before focus/blur ordering
    document.addEventListener('mousedown', this._onDocClick, true);
    document.addEventListener('touchstart', this._onDocClick, true);
    window.addEventListener('resize', this._onResize);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this._onDocClick, true);
    document.removeEventListener('touchstart', this._onDocClick, true);
    window.removeEventListener('resize', this._onResize);
  }

  onInput(): void {
    const q = (this.userName || '').toLowerCase();
    if (!q) {
      this.filteredUsers = [...this.availableUsers];
    } else {
      this.filteredUsers = this.availableUsers.filter(u => u.userName.toLowerCase().includes(q));
    }
    this.highlightedIndex = -1;
    this.showSuggestions = this.filteredUsers.length > 0;
    // ensure the dropdown width matches the input after DOM updates
    if (this.showSuggestions) setTimeout(() => this.adjustDropdownWidth(), 0);
  }

  onFocus(): void {
    this.showSuggestions = this.filteredUsers.length > 0;
    setTimeout(() => this.adjustDropdownWidth(), 0);
  }

  selectUser(user: any): void {
    this.userName = user.userName;
    this.showSuggestions = false;
    this.highlightedIndex = -1;
  }

  hideSuggestionsDelayed(): void {
    // allow click (mousedown) on list items to fire before hiding
    setTimeout(() => {
      this.showSuggestions = false;
      this.highlightedIndex = -1;
    }, 150);
  }

  private onDocumentClick(e: Event): void {
    const target = e.target as Node;
    const loginEl = document.getElementById('login-form');
    if (!loginEl) return;
    if (!loginEl.contains(target)) {
      // run inside zone so Angular detects the change
      this.ngZone.run(() => {
        this.showSuggestions = false;
        this.highlightedIndex = -1;
      });
    }
  }

  private adjustDropdownWidth(): void {
    const input = document.getElementById('userName') as HTMLElement | null;
    const list = document.querySelector('#login-form .typeahead-list') as HTMLElement | null;
    const container = input ? input.closest('.typeahead') as HTMLElement : null;
    if (!input || !list || !container) return;
    const inputRect = input.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const width = Math.max(0, inputRect.width);
    const left = inputRect.left - containerRect.left;
    list.style.width = width + 'px';
    list.style.left = left + 'px';
  }

  onKeydown(e: KeyboardEvent): void {
    if (!this.showSuggestions || !this.filteredUsers.length) {
      if (e.key === 'Enter') {
        this.doLogin();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredUsers.length - 1);
      this.scrollHighlightedIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
      this.scrollHighlightedIntoView();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.highlightedIndex >= 0) {
        this.selectUser(this.filteredUsers[this.highlightedIndex]);
      } else {
        this.doLogin();
      }
    } else if (e.key === 'Escape') {
      this.showSuggestions = false;
      this.highlightedIndex = -1;
    }
  }

  private scrollHighlightedIntoView(): void {
    setTimeout(() => {
      const el = document.querySelector('.typeahead-list .active') as HTMLElement;
      if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    }, 0);
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const defaultSrc = '/images/users/default.png';
    // if default already tried, hide the image; otherwise swap to default
    if (!img.src.includes('default.png')) {
      img.onerror = null; // avoid loop if default is missing
      img.src = defaultSrc;
    } else {
      img.style.display = 'none';
    }
  }

  getAvatarUrl(userName: string): string {
    // filename uses the URI-encoded username to avoid unsafe characters
    return '/images/users/' + encodeURIComponent(userName) + '.png';
  }

  doLogin(): void {
    if (!this.userName) { this.showErrorMsg = true; return; }
    this.appService.userLogin({ name: this.userName })
      .subscribe(response => {
        this.appDataService.userId = response.id;
        this.appDataService.userName = response.userName;
        this.router.navigate(['/chat']);
      });
  }
}
