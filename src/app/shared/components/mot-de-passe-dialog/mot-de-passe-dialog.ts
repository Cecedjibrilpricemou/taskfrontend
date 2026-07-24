import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CompteService } from '../../../core/services/compte.service';
import { ErreurApi } from '../../../models/api.model';

function motsDePasseIdentiquesValidator(control: AbstractControl): ValidationErrors | null {
  const nouveau = control.get('nouveauMotDePasse')?.value;
  const confirmation = control.get('confirmationMotDePasse')?.value;
  return nouveau === confirmation ? null : { motsDePasseDifferents: true };
}

@Component({
  selector: 'app-mot-de-passe-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './mot-de-passe-dialog.html',
  styleUrl: './mot-de-passe-dialog.scss',
})
export class MotDePasseDialog {
  private readonly fb = inject(FormBuilder);
  private readonly compteService = inject(CompteService);
  private readonly dialogRef = inject(MatDialogRef<MotDePasseDialog>);

  readonly enCours = signal(false);
  readonly erreur = signal<string | null>(null);

  readonly formulaire = this.fb.nonNullable.group(
    {
      ancienMotDePasse: ['', [Validators.required]],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmationMotDePasse: ['', [Validators.required]],
    },
    { validators: motsDePasseIdentiquesValidator }
  );

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.erreur.set(null);
    this.enCours.set(true);
    const { ancienMotDePasse, nouveauMotDePasse } = this.formulaire.getRawValue();

    this.compteService.changerMotDePasse(ancienMotDePasse, nouveauMotDePasse).subscribe({
      next: () => {
        this.enCours.set(false);
        this.dialogRef.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.enCours.set(false);
        const corps = err.error as ErreurApi | undefined;
        this.erreur.set(corps?.message ?? 'Une erreur est survenue.');
      },
    });
  }

  annuler(): void {
    this.dialogRef.close(false);
  }
}
