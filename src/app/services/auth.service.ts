import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  name: string;
  phone: string;
  email: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://loanbizz-server.onrender.com/api';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    // ✅ Only access localStorage if running in browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        this.currentUser = this.decodeToken(token);
      }
    }
  }

  // ✅ Register new user
  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // ✅ Login and store JWT token
  login(email: string, password: string): Observable<User> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => {
        if (res.token) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', res.token);
          }
          this.currentUser = this.decodeToken(res.token);
          return this.currentUser;
        } else {
          throw new Error('Invalid login response');
        }
      })
    );
  }

  // ✅ Logout
  logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // ✅ Get logged-in user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ✅ Return stored token (used in LoanService)
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // ✅ Check login
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // ✅ Decode JWT payload
  private decodeToken(token: string): User {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (err) {
      console.error('Token decode failed', err);
      return null as any;
    }
  }
}
