import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { ErreurApi } from '../../../../models/api.model';

@Component({
  selector: 'app-creer-utilisateur-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './creer-utilisateur-dialog.html',
  styleUrl: './creer-utilisateur-dialog.scss',
})
export class CreerUtilisateurDialog {
  private readonly fb = inject(FormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly dialogRef = inject(MatDialogRef<CreerUtilisateurDialog>);

  readonly enCours = signal(false);
  readonly erreur = signal<string | null>(null);

  readonly formulaire = this.fb.nonNullable.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(8)]],
  });

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.erreur.set(null);
    this.enCours.set(true);

    this.utilisateurService.creer(this.formulaire.getRawValue()).subscribe({
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
