import { Injectable } from '@angular/core';

export interface User {
  name: string;
  phone: string;
  email: string; // used as login ID
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: User | null = null;

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    this.currentUser = savedUser ? JSON.parse(savedUser) : null;
  }

  // ✅ Register a new user
  register(user: User): boolean {
    const users = this.getAllUsers();

    // check if email already registered
    if (users.find(u => u.email === user.email)) {
      return false; // user already exists
    }

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  // ✅ Login user
  login(email: string, password: string): User | null {
    const users = this.getAllUsers();
    const matchedUser = users.find(u => u.email === email && u.password === password);

    if (matchedUser) {
      this.currentUser = matchedUser;
      localStorage.setItem('currentUser', JSON.stringify(matchedUser));
      return matchedUser; // User Found
    }

    return null; // invalid credentials
  }

  // ✅ Logout
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // ✅ Get logged-in user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // ✅ Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // ✅ Get all registered users
  private getAllUsers(): User[] {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : [];
  }
}
