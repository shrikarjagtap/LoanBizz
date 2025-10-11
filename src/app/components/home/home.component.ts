import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Loan, LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  upcomingLoans: Loan[] = [];
  showTotalDisbursed = false;
  totalDisbursedAmount = 0;

  constructor(private router: Router, private loanService: LoanService) {}

  ngOnInit(): void {
    this.loadUpcomingLoans();
  }

  /** Load upcoming and today's loans for preview section */
  loadUpcomingLoans(): void {
  this.loanService.getLoans().subscribe((loans: Loan[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Normalize dates
    const validLoans = loans.map(loan => ({
      ...loan,
      endDate: new Date(loan.endDate)
    })).filter(loan => loan.endDate >= today);

    // Separate today's and future loans
    const todaysLoans = validLoans.filter(loan => this.isSameDate(loan.endDate, today));
    const futureLoans = validLoans
      .filter(loan => loan.endDate.getTime() > today.getTime())
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
      .slice(0, 3);

    // Merge and remove duplicates (based on borrowerName + endDate)
    const merged = [...todaysLoans, ...futureLoans];
    this.upcomingLoans = merged.filter((loan, index, self) =>
      index === self.findIndex(
        l => l.borrowerName === loan.borrowerName && l.endDate.getTime() === loan.endDate.getTime()
      )
    );
  });
}


  /** Toggle the display of total disbursed amount */
  toggleTotalDisbursed(): void {
    if (!this.showTotalDisbursed) {
      this.calculateTotalDisbursed();
    }
    this.showTotalDisbursed = !this.showTotalDisbursed;
  }

  /** Calculate total principal amount for all ongoing loans */
  calculateTotalDisbursed(): void {
    this.loanService.getLoans().subscribe({
      next: (loans: Loan[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const ongoingLoans = loans.filter(loan => {
          const end = new Date(loan.endDate);
          end.setHours(0, 0, 0, 0);
          return end >= today;
        });

        this.totalDisbursedAmount = ongoingLoans.reduce((sum, loan) => {
          const principal = Number(loan.principalAMT) || 0;
          return sum + principal;
        }, 0);
      },
      error: err => {
        console.error('Error fetching loans:', err);
        this.totalDisbursedAmount = 0;
      }
    });
  }

  /** Utility Methods */
  goToAddLoanForm(): void {
    this.router.navigate(['/add-loan-forms']);
  }

  toggleDetails(loan: Loan): void {
    loan.showDetails = !loan.showDetails;
  }

  isLoanEndingToday(loan: Loan): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(loan.endDate);
    end.setHours(0, 0, 0, 0);
    return this.isSameDate(end, today);
  }

  private isSameDate(d1: Date, d2: Date): boolean {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  }
}
