import { Component, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private loanService: LoanService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 🔥 Warm up backend & DB when login page opens
    this.authService.pingBackend().subscribe({
      next: () => console.log('Backend warmed up'),
      error: (err) => console.error('Health check failed:', err)
    });
  }

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
          this.loanService.setCurrentUser(user.email);
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
