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
  loanId?: number;
  isClosed?: boolean; // ✅ Loan closed flag
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private loansSubject: BehaviorSubject<Loan[]>;
  private closedLoansSubject: BehaviorSubject<Loan[]>;

  private currentUserEmail: string | null = null; // ✅ Added: track logged-in user

  constructor() {
    // Initial empty subjects; will load when user logs in
    this.loansSubject = new BehaviorSubject<Loan[]>([]);
    this.closedLoansSubject = new BehaviorSubject<Loan[]>([]);
  }

  // ✅ Set current user after login
  setCurrentUser(email: string) {
    this.currentUserEmail = email;

    // Load user-specific loans
    const storedLoans = this.loadLoansFromStorage('loans');
    const storedClosed = this.loadLoansFromStorage('closedLoans');
    this.loansSubject.next(storedLoans);
    this.closedLoansSubject.next(storedClosed);
  }

  // ✅ Generate per-user storage key
  private getUserKey(key: 'loans' | 'closedLoans'): string {
    if (!this.currentUserEmail) throw new Error('User not set');
    return `${key}_${this.currentUserEmail}`;
  }

  // ✅ Load from storage (user-specific)
  private loadLoansFromStorage(key: 'loans' | 'closedLoans'): Loan[] {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.getUserKey(key));
      const loans: Loan[] = stored ? JSON.parse(stored) : [];
      loans.forEach(loan => {
        loan.startDate = new Date(loan.startDate);
        loan.endDate = new Date(loan.endDate);
        loan.loanId = loan.loanId || this.generateLoanId(loan);
      });
      return loans;
    }
    return [];
  }

  // ✅ Save to storage (user-specific)
  private saveLoansToStorage(loans: Loan[], key: 'loans' | 'closedLoans'): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getUserKey(key), JSON.stringify(loans));
    }
  }

  // --- GETTERS ---
  getLoans(): Observable<Loan[]> {
    return this.loansSubject.asObservable();
  }

  getClosedLoans(): Observable<Loan[]> {
    return this.closedLoansSubject.asObservable();
  }

  // --- ADD / UPDATE / DELETE ---
  addLoan(loan: Loan): void {
    loan.loanId = this.generateLoanId(loan);
    const current = this.loansSubject.getValue();
    const updated = [...current, loan];
    this.loansSubject.next(updated);
    this.saveLoansToStorage(updated, 'loans');
  }

  updateLoan(updatedLoan: Loan): void {
    const loans = this.loansSubject.getValue().map(loan =>
      loan.loanId === updatedLoan.loanId ? updatedLoan : loan
    );
    this.loansSubject.next(loans);
    this.saveLoansToStorage(loans, 'loans');
  }

  deleteLoan(loan: Loan): Observable<boolean> {
    const updatedLoans = this.loansSubject.value.filter(l => l.loanId !== loan.loanId);
    this.loansSubject.next(updatedLoans);
    this.saveLoansToStorage(updatedLoans, 'loans');
    return of(true);
  }

  // ✅ Delete closed loan permanently
  deleteClosedLoan(loan: Loan): void {
    const updatedClosed = this.closedLoansSubject.value.filter(l => l.loanId !== loan.loanId);
    this.closedLoansSubject.next(updatedClosed);
    this.saveLoansToStorage(updatedClosed, 'closedLoans');
  }

  // ✅ Close Loan (move from active → closed)
  closeLoan(loan: Loan): void {
    loan.isClosed = true;
    const ongoing = this.loansSubject.getValue().filter(l => l.loanId !== loan.loanId);
    const closed = [...this.closedLoansSubject.getValue(), loan];

    this.loansSubject.next(ongoing);
    this.closedLoansSubject.next(closed);

    this.saveLoansToStorage(ongoing, 'loans');
    this.saveLoansToStorage(closed, 'closedLoans');
  }

  // --- Helper ---
  private generateLoanId(loan: Loan): number {
    const start = loan.startDate?.getTime() || 0;
    const end = loan.endDate?.getTime() || 0;
    const timestamp = Date.now();
    const total = loan.totalAmount || 0;
    return timestamp + (end - start) + total;
  }
}
