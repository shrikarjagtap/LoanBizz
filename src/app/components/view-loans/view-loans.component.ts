// src/app/pages/view-loans/view-loans.component.ts
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
  filteredLoans: Loan[] = []; // ✅ for search filtering
  searchTerm: string = ''; // ✅ user’s search input
  selectedDate: string = ''; // ✅ for date filtering
  private backupLoan: { [key: string]: Loan } = {}; // backup by loanId

  constructor(private loanService: LoanService, private router: Router) {}

   ngOnInit(): void {
    try {
      this.loanService.fetchLoans().subscribe({
        next: () => {
          this.loanService.getLoans().subscribe((loans) => {
            this.loans = loans;
            this.filteredLoans = loans; // ✅ initialize filteredLoans
          });
        },
        error: (err) => {
          console.error('Failed to fetch loans on init', err);
          this.loanService.getLoans().subscribe((loans) => {
            this.loans = loans;
            this.filteredLoans = loans; // ✅ fallback
          });
        }
      });
    } catch (e) {
      this.loanService.getLoans().subscribe((loans) => {
        this.loans = loans;
        this.filteredLoans = loans; // ✅ fallback
      });
    }
  }

   onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    const selected = this.selectedDate ? new Date(this.selectedDate).toDateString() : null;

    this.filteredLoans = this.loans.filter((loan) => {
      const matchesText =
        loan.borrowerName?.toLowerCase().includes(term) ||
        loan.principalAMT?.toString().includes(term) ||
        loan.totalAmount?.toString().includes(term);

      const matchesDate =
        selected &&
        (new Date(loan.startDate).toDateString() === selected ||
         new Date(loan.endDate).toDateString() === selected);

      // ✅ Keep both text and date search working together
      if (term && selected) return matchesText && matchesDate;
      if (term) return matchesText;
      if (selected) return matchesDate;
      return true;
    });
  }

  onDateChange(): void {
    this.onSearch(); // ✅ re-filter whenever date changes
  }




  toggleDetails(loan: Loan) {
    loan.showDetails = !loan.showDetails;
  }

  goToAddLoanForm() {
    this.router.navigate(['/add-loan-forms']);
  }

  deleteLoan(loan: Loan) {
    const confirmDelete = confirm(`Are you sure you want to delete the loan for "${loan.borrowerName}"?`);
    if (!confirmDelete) return;

    this.loanService.deleteLoan(loan).subscribe({
      next: () => {
        // subject will refresh; still update local for immediate UX
        this.loans = this.loans.filter(l => l.loanId !== loan.loanId);
        this.filteredLoans = this.filteredLoans.filter(l => l.loanId !== loan.loanId); // ✅ update filtered list
        alert('Loan deleted successfully!');
      },
      error: (err) => {
        console.error('Failed to delete loan', err);
        alert('Failed to delete loan. Try again.');
      }
    });
  }

  editLoan(loan: Loan) {
    if (!loan.loanId) return;
    this.backupLoan[loan.loanId] = { ...loan };
    loan.isEditing = true;
  }

  saveLoan(loan: Loan) {
    if (!loan.loanId) return;
    loan.isEditing = false;
    loan.totalAmount = loan.principalAMT + (loan.principalAMT * loan.int) / 100;

    this.loanService.updateLoan(loan).subscribe({
      next: () => alert('Loan updated successfully!'),
      error: (err) => {
        console.error('Failed to update loan', err);
        alert('Failed to update loan. Try again.');
      }
    });
  }

  cancelEdit(loan: Loan) {
    loan.isEditing = false;
    if (!loan.loanId) return;
    const backup = this.backupLoan[loan.loanId];
    if (backup) {
      Object.assign(loan, backup);
      delete this.backupLoan[loan.loanId];
    }
  }

  trackByLoanId(index: number, loan: Loan): any {
    return loan.loanId;
  }

  closeLoan(loan: Loan) {
    const confirmClose = confirm(`Are you sure you want to close the loan for "${loan.borrowerName}"?`);
    if (!confirmClose || !loan.loanId) return;

    this.loanService.closeLoan(loan).subscribe({
      next: () => {
        this.loans = this.loans.filter(l => l.loanId !== loan.loanId);
        alert('Loan closed and moved to Closed Loans!');
      },
      error: (err) => {
        console.error('Failed to close loan', err);
        alert('Failed to close loan. Try again.');
      }
    });
  }
}
