import { Component } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private loanService: LoanService,
    private router: Router
  ) {}

  loginUser(): void {
    // Prevent double-click spam
    if (this.isLoading) {
      return;
    }

    this.errorMessage = null;
    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (user: User) => {
        this.isLoading = false;

        if (user && user.email) {
          // Load user loans in background
          this.loanService.setCurrentUser(user.email);
          // Optional: you can replace alert with a toast later
          alert('✅ Login successful!');
          this.router.navigate(['/home']);
        } else {
          this.errorMessage = 'Invalid email or password.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed:', err);
        this.errorMessage = 'Invalid email or password.';
      }
    });
  }
}
