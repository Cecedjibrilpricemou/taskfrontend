import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TacheService } from '../../../../core/services/tache.service';
import { PrioriteTache, TacheListe } from '../../../../models/tache.model';
import { ErreurApi } from '../../../../models/api.model';

export interface DonneesTacheDialog {
  tache?: TacheListe;
}

@Component({
  selector: 'app-tache-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './tache-dialog.html',
  styleUrl: './tache-dialog.scss',
})
export class TacheDialog {
  private readonly fb = inject(FormBuilder);
  private readonly tacheService = inject(TacheService);
  private readonly dialogRef = inject(MatDialogRef<TacheDialog>);
  protected readonly donnees = inject<DonneesTacheDialog>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  protected readonly modeEdition = !!this.donnees.tache;
  protected readonly priorites: PrioriteTache[] = ['basse', 'moyenne', 'haute'];

  readonly enCours = signal(false);
  readonly erreur = signal<string | null>(null);

  readonly formulaire = this.fb.nonNullable.group({
    titre: [this.donnees.tache?.titre ?? '', [Validators.required, Validators.minLength(3)]],
    description: [this.donnees.tache?.description ?? ''],
    priorite: [this.donnees.tache?.priorite ?? ('moyenne' as PrioriteTache), [Validators.required]],
    dateEcheance: [this.donnees.tache?.date_echeance?.substring(0, 10) ?? ''],
  });

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.erreur.set(null);
    this.enCours.set(true);
    const valeurs = this.formulaire.getRawValue();
    const entree = {
      titre: valeurs.titre,
      description: valeurs.description || undefined,
      priorite: valeurs.priorite,
      dateEcheance: valeurs.dateEcheance || undefined,
    };

    const requete = this.modeEdition
      ? this.tacheService.modifier(this.donnees.tache!.id, entree)
      : this.tacheService.creer(entree);

    requete.subscribe({
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
