import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Loan, LoanService } from '../../services/loan.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-loans',
  standalone: true,
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './view-loans.component.html',
  styleUrls: ['./view-loans.component.css']
})
export class ViewLoansComponent implements OnInit {
  loans: Loan[] = [];
  private backupLoan: { [key: string]: Loan } = {}; // temp storage for cancel

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
        this.loans = this.loans.filter(l => l !== loan);
        alert('Loan deleted successfully!');
      });
    }
  }

  // -------------------- Edit Feature --------------------
  editLoan(loan: Loan) {
    // backup current values in case of cancel
    this.backupLoan[loan.borrowerName] = { ...loan };
    loan.isEditing = true;
  }

  saveLoan(loan: Loan) {
    loan.isEditing = false;
    // save changes to the service
    this.loanService.updateLoan(loan);
  }

  cancelEdit(loan: Loan) {
    loan.isEditing = false;
    // restore backup values
    const backup = this.backupLoan[loan.borrowerName];
    if (backup) {
      Object.assign(loan, backup);
      delete this.backupLoan[loan.borrowerName];
    }
  }
}
