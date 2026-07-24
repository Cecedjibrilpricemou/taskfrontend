import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TacheService } from '../../../../core/services/tache.service';
import { UtilisateurService } from '../../../../core/services/utilisateur.service';
import { TacheListe } from '../../../../models/tache.model';
import { ErreurApi } from '../../../../models/api.model';

export interface DonneesAttributionDialog {
  tache: TacheListe;
}

@Component({
  selector: 'app-attribution-dialog',
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './attribution-dialog.html',
  styleUrl: './attribution-dialog.scss',
})
export class AttributionDialog {
  private readonly tacheService = inject(TacheService);
  protected readonly utilisateurService = inject(UtilisateurService);
  private readonly dialogRef = inject(MatDialogRef<AttributionDialog>);
  protected readonly donnees = inject<DonneesAttributionDialog>(MAT_DIALOG_DATA);

  protected readonly utilisateursAssignables = this.utilisateurService
    .utilisateurs()
    .filter((u) => u.role === 'utilisateur');

  private readonly idsInitiaux = (this.donnees.tache.utilisateurs_assignes_ids ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number);

  protected readonly selection = signal<Set<number>>(new Set(this.idsInitiaux));

  readonly enCours = signal(false);
  readonly erreur = signal<string | null>(null);

  basculer(id: number, coche: boolean): void {
    const nouvelle = new Set(this.selection());
    if (coche) {
      nouvelle.add(id);
    } else {
      nouvelle.delete(id);
    }
    this.selection.set(nouvelle);
  }

  soumettre(): void {
    const ids = Array.from(this.selection());
    if (ids.length === 0) {
      this.erreur.set('Au moins un utilisateur doit être sélectionné');
      return;
    }

    this.erreur.set(null);
    this.enCours.set(true);

    this.tacheService.attribuer(this.donnees.tache.id, ids).subscribe({
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
