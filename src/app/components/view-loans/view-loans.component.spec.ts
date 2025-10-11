import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Loan, LoanService } from '../../services/loan.service';

@Component({
  selector: 'app-view-loans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-loans.component.html',
  styleUrls: ['./view-loans.component.css']
})
export class ViewLoansComponent implements OnInit {
  loans: Loan[] = [];

  constructor(private loanService: LoanService) {}

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

  deleteLoan(loan: Loan) {
    const confirmDelete = confirm(`Are you sure you want to delete the loan for "${loan.borrowerName}"?`);
    if (confirmDelete) {
      this.loanService.deleteLoan(loan).subscribe(() => {
        this.loans = this.loans.filter(l => l !== loan); // remove from UI
        alert('Loan deleted successfully!');
      });
    }
  }
}
