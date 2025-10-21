import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'LoanbizzV18';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // ✅ Force logout on page refresh to always go to login
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
