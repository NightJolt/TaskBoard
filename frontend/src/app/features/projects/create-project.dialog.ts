import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectsService } from '../../core/projects.service';

@Component({
  selector: 'app-create-project-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './create-project.dialog.html',
  styleUrl: './create-project.dialog.css',
})
export class CreateProjectDialog {
  private fb = inject(FormBuilder);
  private projectsService = inject(ProjectsService);
  private dialogRef = inject(MatDialogRef<CreateProjectDialog>);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  onCreate() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const { name, description } = this.form.getRawValue();

    this.projectsService.create({ name, description }).subscribe({
      next: (project) => this.dialogRef.close(project),
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(
          err.error?.message || 'Failed to create project',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }
}
