// src/app/pages/add-loan-form/add-loan-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Loan, LoanService } from '../../services/loan.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-loan-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add-loan-form.component.html',
  styleUrls: ['./add-loan-form.component.css']
})
export class AddLoanFormComponent implements OnInit {
  loan = {
    borrowerName: '',
    borrowerContact: '',
    principalAMT: 0,
    int: 0,
    totalAmount: 0,
    securityAsset: '',
    startDate: '',
    endDate: '',
    totalTenure: '',
    investor: '',
    investorPercentage: ''
  };

  constructor(
    private router: Router,
    private loanService: LoanService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // ensure LoanService has current user (so add will work)
    const user = this.authService.getCurrentUser();
    if (user && user.email) {
      this.loanService.setCurrentUser(user.email);
    } else {
      alert('❌ User not logged in. Please login again.');
      this.router.navigate(['/login']);
    }
  }

  calculateTotal() {
    if (this.loan.principalAMT && this.loan.int) {
      this.loan.totalAmount = this.loan.principalAMT + (this.loan.principalAMT * this.loan.int) / 100;
    } else {
      this.loan.totalAmount = 0;
    }
  }

  clearForm() {
    this.loan = {
      borrowerName: '',
      borrowerContact: '',
      principalAMT: 0,
      int: 0,
      totalAmount: 0,
      securityAsset: '',
      startDate: '',
      endDate: '',
      totalTenure: '',
      investor: '',
      investorPercentage: ''
    };
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      alert('❌ Please fill all required fields correctly!');
      return;
    }

    const newLoan: Loan = {
      borrowerName: this.loan.borrowerName,
      borrowerContact: this.loan.borrowerContact,
      principalAMT: Number(this.loan.principalAMT),
      int: Number(this.loan.int),
      totalAmount: Number(this.loan.totalAmount),
      securityAsset: this.loan.securityAsset,
      startDate: new Date(this.loan.startDate),
      endDate: new Date(this.loan.endDate),
      totalTenure: this.loan.totalTenure ? Number(this.loan.totalTenure) : undefined,
      investor: this.loan.investor,
      investorPercentage: this.loan.investorPercentage ? Number(this.loan.investorPercentage) : undefined,
      showDetails: false,
      isClosed: false
    };

    this.loanService.addLoan(newLoan).subscribe({
      next: () => {
        alert('✅ Loan submitted successfully!');
        form.resetForm();
        this.clearForm();
        this.router.navigate(['/viewLoans']);
      },
      error: (err) => {
        console.error('Error adding loan:', err);
        alert('❌ Failed to submit loan. Please try again.');
      }
    });
  }

  goBackToHome() {
    this.router.navigate(['/home']);
  }
}
