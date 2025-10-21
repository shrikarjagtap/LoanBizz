import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string = '';
  phone: string = '';
  gmail: string = '';
  password: string = '';
  confirmPassword: string = '';

  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  registerUser(): void {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      alert('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.isLoading = true;

    this.authService
      .register({
        name: this.name,
        phone: this.phone,
        email: this.gmail,
        password: this.password
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          alert('✅ Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          if (err.status === 409) {
            alert('Email already registered!');
          } else {
            alert('Registration failed. Try again.');
          }
        }
      });
  }
}
