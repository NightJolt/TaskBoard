import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { AdminService, AdminProject, InviteCode } from '../../core/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    DatePipe,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  codes = signal<InviteCode[]>([]);
  users = signal<{ id: string; email: string; name: string; role: string }[]>([]);
  allProjects = signal<AdminProject[]>([]);
  loading = signal(true);
  generating = signal(false);
  selectedTab = 0;

  userName = computed(() => this.authService.user()?.name ?? '');
  userId = computed(() => this.authService.user()?.id);
  displayedColumns = ['code', 'status', 'usedBy', 'expiresAt', 'createdAt'];
  userColumns = ['name', 'email', 'role'];
  projectColumns = ['name', 'owner', 'members', 'createdAt', 'actions'];

  ngOnInit() {
    this.loadData();
  }

  isExpired(code: InviteCode): boolean {
    return new Date(code.expiresAt) < new Date();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  onLogout() {
    this.authService.logout();
  }

  onGenerate() {
    this.generating.set(true);
    this.adminService.generateInviteCode().subscribe({
      next: () => {
        this.generating.set(false);
        this.loadData();
      },
      error: () => this.generating.set(false),
    });
  }

  onCopy(code: string) {
    navigator.clipboard.writeText(code);
    this.snackBar.open('Code copied to clipboard', 'Close', { duration: 2000 });
  }

  onLeaveProject(projectId: string) {
    this.adminService.leaveProject(projectId).subscribe({
      next: () => {
        this.snackBar.open('Left project', 'Close', { duration: 2000 });
        this.loadProjects();
      },
    });
  }

  onJoinProject(projectId: string) {
    this.adminService.joinProject(projectId).subscribe({
      next: () => {
        this.snackBar.open('Joined project', 'Close', { duration: 2000 });
        this.loadProjects();
      },
      error: (err) => {
        this.snackBar.open(
          err.error?.message || 'Failed to join',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }

  onDeleteProject(project: AdminProject) {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    this.adminService.deleteProject(project.id).subscribe({
      next: () => this.loadProjects(),
    });
  }

  private loadData() {
    this.loading.set(true);
    this.adminService.listInviteCodes().subscribe({
      next: (codes) => {
        this.codes.set(codes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.adminService.listUsers().subscribe({
      next: (users) => this.users.set(users),
    });
    this.loadProjects();
  }

  private loadProjects() {
    this.adminService.listAllProjects().subscribe({
      next: (projects) => this.allProjects.set(projects),
    });
  }
}
