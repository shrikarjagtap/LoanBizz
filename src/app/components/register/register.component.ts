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

  constructor(private authService: AuthService, private router: Router) {}

  registerUser(): void {
    // password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      alert('Password must contain at least 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const registered = this.authService.register({
      name: this.name,
      phone: this.phone,
      email: this.gmail,
      password: this.password
    });

    if (!registered) {
      alert('Gmail already registered!');
      return;
    }

    alert('Registration successful! Please login.');
    this.router.navigate(['/login']);
  }
}
