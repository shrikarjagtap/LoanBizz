import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Loan {
  borrowerName: string;
  principalAMT: number;
  int: number;
  totalAmount: number;
  startDate: Date;
  endDate: Date;
  borrowerContact?: string;
  securityAsset?: string;
  investor?: string;
  investorPercentage?: number;
  totalTenure?: number;
  showDetails?: boolean;
  isEditing?: boolean;
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

  private loadLoansFromStorage(): Loan[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('loans');
      const loans: Loan[] = stored ? JSON.parse(stored) : [];
      loans.forEach(loan => {
        loan.startDate = new Date(loan.startDate);
        loan.endDate = new Date(loan.endDate);
      });
      return loans;
    }
    return [];
  }

  private saveLoansToStorage(loans: Loan[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loans', JSON.stringify(loans));
    }
  }

  getLoans(): Observable<Loan[]> {
    return this.loansSubject.asObservable();
  }

  addLoan(loan: Loan): void {
    const current = this.loansSubject.getValue();
    const updated = [...current, loan];
    this.loansSubject.next(updated);
    this.saveLoansToStorage(updated);
  }

  deleteLoan(loan: Loan): Observable<boolean> {
    const updatedLoans = this.loansSubject.value.filter(l => l !== loan);
    this.loansSubject.next(updatedLoans);
    this.saveLoansToStorage(updatedLoans);
    return of(true);
  }

  updateLoan(updatedLoan: Loan): void {
    const loans = this.loansSubject.getValue().map(loan =>
      loan.borrowerName === updatedLoan.borrowerName ? updatedLoan : loan
    );
    this.loansSubject.next(loans);
    this.saveLoansToStorage(loans);
  }
}
