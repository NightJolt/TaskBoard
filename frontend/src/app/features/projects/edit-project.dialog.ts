import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectsService, Project } from '../../core/projects.service';

@Component({
  selector: 'app-edit-project-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './edit-project.dialog.html',
  styleUrl: './edit-project.dialog.css',
})
export class EditProjectDialog {
  private fb = inject(FormBuilder);
  private projectsService = inject(ProjectsService);
  private dialogRef = inject(MatDialogRef<EditProjectDialog>);
  private snackBar = inject(MatSnackBar);
  private project: Project = inject(MAT_DIALOG_DATA);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    name: [this.project.name, Validators.required],
    description: [this.project.description],
  });

  onSave() {
    if (this.form.invalid) return;

    this.loading.set(true);
    const { name, description } = this.form.getRawValue();

    this.projectsService.update(this.project.id, { name, description }).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open(
          err.error?.message || 'Failed to update project',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }
}
