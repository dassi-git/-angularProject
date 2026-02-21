import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginDTO } from '../models';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  user?: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Account`;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'current_user';
  
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();
  private readonly currentUserSignal = signal<User | null>(null);
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticatedSignal = computed(() => !!this.getToken());

  constructor() {
    this.loadUserFromStorage();
  }

  register(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user)
      .pipe(tap(response => this.setSession(response)));
  }

  login(credentials: LoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap(response => {
        if (response.token) {
          this.setSession(response);
        }
      }));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.setCurrentUser(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'Admin' || user?.role === 'Manager';
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResponse.token);
    
    if (authResponse.user) {
      localStorage.setItem(this.userKey, JSON.stringify(authResponse.user));
      this.setCurrentUser(authResponse.user);
    } else {
      const payload = this.parseJwtPayload(authResponse.token);
      const userIdStr = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] 
        || payload['sub'] 
        || payload['nameid'] 
        || payload['userId'] 
        || payload['id'];
      const userId = userIdStr ? parseInt(String(userIdStr), 10) : undefined;
      const user: User = {
        id: Number.isFinite(userId) ? userId : undefined,
        name: String(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload['name'] || payload['unique_name'] || 'User'),
        email: String(payload['email'] || payload['sub'] || 'user@example.com'),
        phone: '',
        password: '',
        role: String(payload['role'] || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Customer')
      };

      localStorage.setItem(this.userKey, JSON.stringify(user));
      this.setCurrentUser(user);
    }
  }

  private parseJwtPayload(token: string): Record<string, unknown> {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      return {};
    }
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(this.userKey);
    
    if (token && userJson && userJson !== 'undefined') {
      try {
        const user = JSON.parse(userJson) as User;
        this.setCurrentUser(user);
      } catch (error) {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
      }
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSignal.set(user);
    this.currentUserSubject.next(user);
  }
}
