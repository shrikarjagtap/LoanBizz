import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddLoanFormComponent } from './components/add-loan-form/add-loan-form.component';
import { MoreActionsComponent } from './components/more-actions/more-actions.component';
import { ViewLoansComponent } from './components/view-loans/view-loans.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },

//   {path:'login', component:},
  { path: 'home', component: HomeComponent },
  {path:'add-loan-forms',component:AddLoanFormComponent},
  {path:'more-Actions', component:MoreActionsComponent},
  {path:'viewLoans',component:ViewLoansComponent}
];
