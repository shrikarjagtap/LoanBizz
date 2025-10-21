// src/app/pages/closed-loans/closed-loans.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Loan, LoanService } from '../../services/loan.service';

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
    // fetch all loans, filter closed ones and normalize
    try {
      this.loanService.fetchLoans().subscribe({
        next: (all) => {
          // fetchLoans updates the loansSubject (active). To get closed ones, call backend directly:
          this.loanService.getClosedLoans().subscribe({
            next: (serverLoans: any[]) => {
              const closed = (serverLoans || [])
                .map(s => ({
                  ...s,
                  startDate: s.startDate ? new Date(s.startDate) : new Date(),
                  endDate: s.endDate ? new Date(s.endDate) : new Date(),
                  loanId: s._id ? s._id.toString() : s.loanId,
                  isClosed: !!s.isClosed
                }))
                .filter(l => l.isClosed);
              this.closedLoans = closed;
            },
            error: (err) => {
              console.error('Failed to load closed loans', err);
            }
          });
        },
        error: (err) => {
          console.error('fetchLoans (in closed) failed', err);
        }
      });
    } catch (e) {
      // fallback: request closed loans directly
      this.loanService.getClosedLoans().subscribe({
        next: (serverLoans: any[]) => {
          const closed = (serverLoans || [])
            .map(s => ({
              ...s,
              startDate: s.startDate ? new Date(s.startDate) : new Date(),
              endDate: s.endDate ? new Date(s.endDate) : new Date(),
              loanId: s._id ? s._id.toString() : s.loanId,
              isClosed: !!s.isClosed
            }))
            .filter(l => l.isClosed);
          this.closedLoans = closed;
        },
        error: (err) => {
          console.error('Failed to load closed loans', err);
        }
      });
    }
  }

  getSafeId(loan: Loan): string {
    return loan.loanId != null ? loan.loanId.toString() : `${loan.borrowerName}-${loan.startDate?.getTime() ?? ''}`;
  }

  toggleExpand(loan: Loan): void {
    const id = this.getSafeId(loan);
    this.expandedLoans[id] = !this.expandedLoans[id];
  }

  deleteClosedLoan(loan: Loan): void {
    const confirmed = confirm(`Permanently delete closed loan for "${loan.borrowerName}"?`);
    if (!confirmed) return;
    if (!loan.loanId) {
      console.error('Loan ID not found');
      alert('Cannot delete loan — ID missing.');
      return;
    }
    this.loanService.deleteLoan(loan).subscribe({
      next: () => {
        this.closedLoans = this.closedLoans.filter(l => l.loanId !== loan.loanId);
        alert('Closed loan deleted permanently.');
      },
      error: (err) => {
        console.error('Failed to delete closed loan', err);
        alert('Failed to delete closed loan. Try again.');
      }
    });
  }
}
