import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-more-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './more-actions.component.html',
  styleUrl: './more-actions.component.css'
})
export class MoreActionsComponent {

  constructor(private router: Router) {}

  goBackToHome() {
    this.router.navigate(['/home']);
  }

}
