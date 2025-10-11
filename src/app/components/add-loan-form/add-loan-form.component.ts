import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Loan, LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-add-loan-form',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './add-loan-form.component.html',
  styleUrls: ['./add-loan-form.component.css']
})
export class AddLoanFormComponent {
  loan = {
    borrowerName: '',
    borrowerContact: '',
    principalAMT: 0,
    int: 0,
    totalAmount:0,
    securityAsset: '',
    startDate: '',
    endDate: '',
    totalTenure: '',
    investor: '',
    investorPercentage: ''
  };

  constructor(private router: Router, private loanService: LoanService) {}

  calculateTotal() {
  this.loan.totalAmount = this.loan.principalAMT + (this.loan.principalAMT * this.loan.int) / 100;
}

  clearForm() {
    this.loan = {
      borrowerName: '',
      borrowerContact: '',
      principalAMT: 0,
      int: 0,
      totalAmount:0,
      securityAsset: '',
      startDate: '',
      endDate: '',
      totalTenure: '',
      investor: '',
      investorPercentage: ''
    };
  }

  onSubmit() {
    const newLoan: Loan = {
      borrowerName: this.loan.borrowerName,
      borrowerContact: this.loan.borrowerContact,
      principalAMT: this.loan.principalAMT,
      int: this.loan.int,
      totalAmount: this.loan.totalAmount,
      securityAsset: this.loan.securityAsset,
      startDate: new Date(this.loan.startDate),
      endDate: new Date(this.loan.endDate),
      totalTenure: Number(this.loan.totalTenure),
      investor: this.loan.investor,
      investorPercentage: Number(this.loan.investorPercentage),
      showDetails: false
    };

    this.loanService.addLoan(newLoan);

    alert('Loan added successfully!');
    this.clearForm();

    this.router.navigate(['/view-loans']);
  }

  goBackToHome() {
    this.router.navigate(['/home']);
  }
}
