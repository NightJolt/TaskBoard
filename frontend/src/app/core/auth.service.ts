import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from './environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'accessToken';
  private readonly USER_KEY = 'user';

  readonly token = signal<string | null>(this.getStored(this.TOKEN_KEY));
  readonly user = signal<User | null>(this.getStoredUser());
  readonly isAuthenticated = computed(() => !!this.token());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (this.token()) {
      this.loadCurrentUser();
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap((res) => this.handleAuth(res)));
  }

  register(email: string, password: string, name: string, inviteCode: string) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, {
        email,
        password,
        name,
        inviteCode,
      })
      .pipe(tap((res) => this.handleAuth(res)));
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.token.set(res.accessToken);
    this.user.set(res.user);
  }

  private loadCurrentUser() {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.user.set(user);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.logout();
        }
      },
    });
  }

  private getStored(key: string): string | null {
    return localStorage.getItem(key);
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem(this.USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
