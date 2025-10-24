// src/app/services/loan.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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
  loanId?: string;
  isClosed?: boolean;
  userEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private loansSubject = new BehaviorSubject<Loan[]>([]);
  private currentUserEmail: string | null = null;
  private apiUrl = 'https://loanbizz-server.onrender.com/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // 🧠 Helper: include token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  setCurrentUser(email: string) {
    this.currentUserEmail = email;
    this.fetchLoans().subscribe({
      next: () => {},
      error: (err) => console.error('Failed to fetch loans on setCurrentUser', err)
    });
  }

  fetchLoans(): Observable<Loan[]> {
    if (!this.currentUserEmail) throw new Error('User not set');
    return this.http.get<any[]>(`${this.apiUrl}/loans/${encodeURIComponent(this.currentUserEmail)}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(serverLoans => {
        const normalized = serverLoans.map(s => ({
          borrowerName: s.borrowerName,
          principalAMT: s.principalAMT,
          int: s.int,
          totalAmount: s.totalAmount,
          startDate: s.startDate ? new Date(s.startDate) : new Date(),
          endDate: s.endDate ? new Date(s.endDate) : new Date(),
          borrowerContact: s.borrowerContact,
          securityAsset: s.securityAsset,
          investor: s.investor,
          investorPercentage: s.investorPercentage,
          totalTenure: s.totalTenure,
          showDetails: s.showDetails ?? false,
          isEditing: false,
          loanId: s._id ? s._id.toString() : s.loanId,
          isClosed: !!s.isClosed,
          userEmail: s.userEmail
        }));
        const active = normalized.filter(l => !l.isClosed);
        this.loansSubject.next(active);
      }),
      catchError(err => {
        console.error('fetchLoans error', err);
        throw err;
      })
    );
  }

  getLoans(): Observable<Loan[]> {
    return this.loansSubject.asObservable();
  }

  addLoan(loan: Loan): Observable<Loan> {
    if (!this.currentUserEmail) return throwError(() => new Error('User not set'));
    const payload = { ...loan, userEmail: this.currentUserEmail, isClosed: false };
    return this.http.post<any>(`${this.apiUrl}/loans`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.fetchLoans().subscribe({ next: () => {}, error: e => console.error(e) })),
      catchError(err => {
        console.error('addLoan error', err);
        throw err;
      })
    );
  }

  deleteLoan(loan: Loan): Observable<any> {
    if (!loan.loanId) return throwError(() => new Error('Loan ID not set'));
    return this.http.delete(`${this.apiUrl}/loans/${loan.loanId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.fetchLoans().subscribe({ next: () => {}, error: e => console.error(e) })),
      catchError(err => {
        console.error('deleteLoan error', err);
        throw err;
      })
    );
  }

  updateLoan(updatedLoan: Loan): Observable<Loan> {
    if (!updatedLoan.loanId) return throwError(() => new Error('Loan ID not set'));
    const payload = { ...updatedLoan };
    return this.http.put<any>(`${this.apiUrl}/loans/${updatedLoan.loanId}`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.fetchLoans().subscribe({ next: () => {}, error: e => console.error(e) })),
      catchError(err => {
        console.error('updateLoan error', err);
        throw err;
      })
    );
  }

  closeLoan(loan: Loan) {
    if (!loan.loanId) return throwError(() => new Error('Loan ID not set'));
    const payload = { ...loan, isClosed: true };
    return this.http.put<any>(`${this.apiUrl}/loans/${loan.loanId}`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => this.fetchLoans().subscribe({ next: () => {}, error: e => console.error(e) })),
      catchError(err => {
        console.error('closeLoan error', err);
        throw err;
      })
    );
  }

  getClosedLoans(): Observable<Loan[]> {
    if (!this.currentUserEmail) return throwError(() => new Error('User not set'));
    return this.http.get<any[]>(`${this.apiUrl}/loans/${encodeURIComponent(this.currentUserEmail)}`, {
      headers: this.getAuthHeaders()
    });
  }
}
