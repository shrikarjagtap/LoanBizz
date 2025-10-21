import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  private apiUrl = 'http://localhost:5000/api';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    // ✅ On load, decode stored token if available
    const token = localStorage.getItem('token');
    if (token) {
      this.currentUser = this.decodeToken(token);
    }
  }

  // ✅ Register new user
  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // ✅ Login user and save JWT token
  login(email: string, password: string): Observable<User> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      map(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          this.currentUser = this.decodeToken(res.token);
          return this.currentUser;
        } else {
          throw new Error('Invalid login response');
        }
      })
    );
  }

  // ✅ Logout and remove token
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('token');
  }

  // ✅ Get logged-in user info
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ✅ Return stored token (used in LoanService)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Check if logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // ✅ Decode token payload to get user info
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
