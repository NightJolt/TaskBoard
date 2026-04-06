import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { EditProjectDialog } from '../projects/edit-project.dialog';

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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private projectsService = inject(ProjectsService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  projects = signal<Project[]>([]);
  loading = signal(true);
  userName = computed(() => this.authService.user()?.name ?? '');

  private userId = computed(() => this.authService.user()?.id);

  ngOnInit() {
    this.loadProjects();
  }

  isOwner(project: Project): boolean {
    return project.owner.id === this.userId();
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

  onEditProject(event: Event, project: Project) {
    event.stopPropagation();
    this.dialog
      .open(EditProjectDialog, { data: project })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.loadProjects();
      });
  }

  onDeleteProject(event: Event, project: Project) {
    event.stopPropagation();
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;

    this.projectsService.delete(project.id).subscribe({
      next: () => this.loadProjects(),
    });
  }

  onLogout() {
    this.authService.logout();
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
