import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Loan, LoanService } from '../../services/loan.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-loans',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './view-loans.component.html',
  styleUrls: ['./view-loans.component.css']
})
export class ViewLoansComponent implements OnInit {
  loans: Loan[] = [];
  private backupLoan: { [key: number]: Loan } = {}; // backup by loanId

  constructor(private loanService: LoanService, private router: Router) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loanService.getLoans().subscribe((loans: Loan[]) => {
      this.loans = loans;
    });
  }

  toggleDetails(loan: Loan) {
    loan.showDetails = !loan.showDetails;
  }

  goToAddLoanForm() {
    this.router.navigate(['/add-loan-forms']);
  }

  deleteLoan(loan: Loan) {
    const confirmDelete = confirm(`Are you sure you want to delete the loan for "${loan.borrowerName}"?`);
    if (confirmDelete) {
      this.loanService.deleteLoan(loan).subscribe(() => {
        this.loans = this.loans.filter(l => l.loanId !== loan.loanId);
        alert('Loan deleted successfully!');
      });
    }
  }

  editLoan(loan: Loan) {
    // backup by loanId
    this.backupLoan[loan.loanId!] = { ...loan };
    loan.isEditing = true;
  }

  saveLoan(loan: Loan) {
    loan.isEditing = false;
    // recalc totalAmount if principal or int changed
    loan.totalAmount = loan.principalAMT + (loan.principalAMT * loan.int) / 100;
    this.loanService.updateLoan(loan);
  }

  cancelEdit(loan: Loan) {
    loan.isEditing = false;
    const backup = this.backupLoan[loan.loanId!];
    if (backup) {
      Object.assign(loan, backup);
      delete this.backupLoan[loan.loanId!];
    }
  }

  trackByLoanId(index: number, loan: Loan): any {
    return loan.loanId;
  }
}
