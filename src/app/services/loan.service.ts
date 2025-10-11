import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Loan {
  borrowerName: string;
  principalAMT: number;
  int: number;               // Interest %
  totalAmount: number;       // Calculated total
  startDate: Date;
  endDate: Date;
  borrowerContact?: string;
  securityAsset?: string;
  investor?: string;
  investorPercentage?: number;
  totalTenure?: number;
  showDetails?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private loansSubject: BehaviorSubject<Loan[]>;

  constructor() {
    const storedLoans: Loan[] = this.loadLoansFromStorage();
    this.loansSubject = new BehaviorSubject<Loan[]>(storedLoans);
  }

  // -------------------------------
  // Browser-safe localStorage load
  // -------------------------------
  private loadLoansFromStorage(): Loan[] {
    if (typeof window !== 'undefined') { // Ensure we're in browser
      const stored = localStorage.getItem('loans');
      const loans: Loan[] = stored ? JSON.parse(stored) : [];
      // Convert date strings to Date objects
      loans.forEach(loan => {
        loan.startDate = new Date(loan.startDate);
        loan.endDate = new Date(loan.endDate);
      });
      return loans;
    }
    return []; // fallback for SSR
  }

  private saveLoansToStorage(loans: Loan[]): void {
    if (typeof window !== 'undefined') { // Browser only
      localStorage.setItem('loans', JSON.stringify(loans));
    }
  }

  // -------------------------------
  // Observable to subscribe
  // -------------------------------
  getLoans(): Observable<Loan[]> {
    return this.loansSubject.asObservable();
  }

  // -------------------------------
  // Add loan
  // -------------------------------
  addLoan(loan: Loan): void {
    const current = this.loansSubject.getValue();
    const updated = [...current, loan];
    this.loansSubject.next(updated);
    this.saveLoansToStorage(updated);
  }

  // -------------------------------
  // Delete loan
  // -------------------------------
  deleteLoan(loan: Loan): Observable<boolean> {
    const updatedLoans = this.loansSubject.value.filter(l => l !== loan);
    this.loansSubject.next(updatedLoans);
    this.saveLoansToStorage(updatedLoans);
    return of(true); // simulate success
  }
}
