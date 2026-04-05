import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <span>TaskBoard</span>
      <span class="spacer"></span>
      <span class="user-name">{{ authService.user()?.name }}</span>
      <button mat-button (click)="authService.logout()">Logout</button>
    </mat-toolbar>
    <div class="content">
      <h2>Dashboard</h2>
      <p>Welcome, {{ authService.user()?.name }}! Projects coming soon.</p>
    </div>
  `,
  styles: `
    .spacer {
      flex: 1 1 auto;
    }

    .user-name {
      margin-right: 16px;
      font-size: 14px;
    }

    .content {
      padding: 24px;
    }
  `,
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
