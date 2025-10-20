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

  constructor(
    private authService: AuthService,
    private loanService: LoanService,
    private router: Router) {}

  loginUser(): void {
    const user: User | null = this.authService.login(this.email, this.password);
    if (user) {
      // ✅ Set current user in LoanService so loans are scoped per user
      this.loanService.setCurrentUser(user.email);

      // alert('Login successful!');
      this.router.navigate(['/home']); // redirect to home page
    } else {
      alert('Invalid Gmail or password');
    }
  }
}
