import { Component, inject } from '@angular/core';
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
  template: `
    <h2 mat-dialog-title>New Project</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Project Name</mat-label>
          <input matInput formControlName="name" />
          @if (form.controls.name.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || loading"
        (click)="onCreate()"
      >
        {{ loading ? 'Creating...' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    :host ::ng-deep .mat-mdc-dialog-content {
      display: flex;
      flex-direction: column;
      min-width: 360px;
      padding-top: 24px !important;
      overflow: visible;
    }

    mat-form-field {
      width: 100%;
    }
  `,
})
export class CreateProjectDialog {
  private fb = inject(FormBuilder);
  private projectsService = inject(ProjectsService);
  private dialogRef = inject(MatDialogRef<CreateProjectDialog>);
  private snackBar = inject(MatSnackBar);

  loading = false;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  onCreate() {
    if (this.form.invalid) return;

    this.loading = true;
    const { name, description } = this.form.getRawValue();

    this.projectsService.create({ name, description }).subscribe({
      next: (project) => this.dialogRef.close(project),
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.message || 'Failed to create project',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }
}
