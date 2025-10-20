import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddLoanFormComponent } from './components/add-loan-form/add-loan-form.component';
import { MoreActionsComponent } from './components/more-actions/more-actions.component';
import { ViewLoansComponent } from './components/view-loans/view-loans.component';
import { ClosedLoansComponent } from './components/closed-loans/closed-loans.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

//   {path:'login', component:},
  {path:'login', component:LoginComponent},
  {path:'register', component:RegisterComponent},
  { path: 'home', component: HomeComponent },
  {path:'add-loan-forms',component:AddLoanFormComponent},
  {path:'more-Actions', component:MoreActionsComponent},
  {path:'viewLoans',component:ViewLoansComponent},
  {path:'closedLoans',component:ClosedLoansComponent}
];
