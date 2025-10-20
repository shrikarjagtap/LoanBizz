import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loan, LoanService } from '../../services/loan.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-closed-loans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './closed-loans.component.html',
  styleUrls: ['./closed-loans.component.css']
})
export class ClosedLoansComponent implements OnInit {
  closedLoans: Loan[] = [];
  expandedLoans: Record<string, boolean> = {};

  constructor(private loanService: LoanService) {}

  ngOnInit(): void {
    this.loanService.getClosedLoans().subscribe(loans => {
      this.closedLoans = loans.map((loan, idx) => {
        const normalized = {
          ...loan,
          startDate: loan.startDate ? new Date(loan.startDate) : new Date(),
          endDate: loan.endDate ? new Date(loan.endDate) : new Date(),
        } as Loan;

        if (!normalized.loanId) {
          normalized.loanId = Date.now() + idx;
        }

        return normalized;
      });
    });
  }

  getSafeId(loan: Loan): string {
    return loan.loanId != null
      ? loan.loanId.toString()
      : `${loan.borrowerName}-${loan.startDate?.getTime() ?? ''}`;
  }

  toggleExpand(loan: Loan): void {
    const id = this.getSafeId(loan);
    this.expandedLoans[id] = !this.expandedLoans[id];
  }

  deleteClosedLoan(loan: Loan): void {
    const confirmed = confirm(`Permanently delete closed loan for "${loan.borrowerName}"?`);
    if (!confirmed) return;

    // Remove from local display array
    this.closedLoans = this.closedLoans.filter(l => l.loanId !== loan.loanId);

    // Persist to localStorage
    try {
      localStorage.setItem('closedLoans', JSON.stringify(this.closedLoans));
    } catch (e) {
      console.error('Failed to persist closedLoans to localStorage', e);
    }

    alert('Closed loan deleted permanently.');
  }
}
