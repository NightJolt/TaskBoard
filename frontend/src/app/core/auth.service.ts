import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  readonly token = signal<string | null>(this.getStoredToken());
  readonly user = signal<User | null>(null);
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
    localStorage.removeItem(this.TOKEN_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    this.token.set(res.accessToken);
    this.user.set(res.user);
  }

  private loadCurrentUser() {
    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) => this.user.set(user),
      error: () => this.logout(),
    });
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
