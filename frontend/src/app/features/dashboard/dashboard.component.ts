import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { ProjectsService, Project } from '../../core/projects.service';
import { CreateProjectDialog } from '../projects/create-project.dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <mat-toolbar color="primary">
      <span>TaskBoard</span>
      <span class="spacer"></span>
      <span class="user-name">{{ authService.user()?.name }}</span>
      <button mat-button (click)="authService.logout()">Logout</button>
    </mat-toolbar>

    <div class="content">
      <div class="header">
        <h2>My Projects</h2>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          New Project
        </button>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="40" />
        </div>
      } @else if (projects().length === 0) {
        <div class="empty">
          <mat-icon class="empty-icon">folder_open</mat-icon>
          <p>No projects yet. Create one to get started!</p>
        </div>
      } @else {
        <div class="project-grid">
          @for (project of projects(); track project.id) {
            <mat-card
              class="project-card"
              [class.owned]="isOwner(project)"
              (click)="openProject(project)"
            >
              <mat-card-header>
                <mat-card-title>{{ project.name }}</mat-card-title>
                @if (isOwner(project)) {
                  <span class="owner-chip">Owner</span>
                }
              </mat-card-header>
              <mat-card-content>
                <p class="description">
                  {{ project.description || 'No description' }}
                </p>
                <div class="meta">
                  <span class="members">
                    <mat-icon>group</mat-icon>
                    {{ project.members.length }} member{{ project.members.length !== 1 ? 's' : '' }}
                  </span>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h2 {
      margin: 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .empty {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .project-card {
      cursor: pointer;
      transition: box-shadow 0.2s;
    }

    .project-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .project-card.owned {
      border-left: 4px solid #1976d2;
    }

    mat-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .owner-chip {
      font-size: 11px;
      background: #1976d2;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
    }

    .description {
      color: #666;
      margin: 8px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta {
      display: flex;
      align-items: center;
      color: #888;
      font-size: 13px;
    }

    .members {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .members mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `,
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private projectsService = inject(ProjectsService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  projects = signal<Project[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadProjects();
  }

  isOwner(project: Project): boolean {
    return project.owner.id === this.authService.user()?.id;
  }

  openProject(project: Project) {
    this.router.navigate(['/projects', project.id]);
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateProjectDialog);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProjects();
      }
    });
  }

  private loadProjects() {
    this.loading.set(true);
    this.projectsService.list().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
