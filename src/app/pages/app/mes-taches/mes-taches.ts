import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TacheService } from '../../../core/services/tache.service';
import { MaTache, StatutTache } from '../../../models/tache.model';
import { classePriorite, classeStatutTache, libellePriorite, libelleStatutTache } from '../../../shared/badges';
import { ErreurApi } from '../../../models/api.model';

@Component({
  selector: 'app-mes-taches',
  imports: [
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './mes-taches.html',
  styleUrl: './mes-taches.scss',
})
export class MesTaches {
  protected readonly tacheService = inject(TacheService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly libellePriorite = libellePriorite;
  protected readonly classePriorite = classePriorite;
  protected readonly libelleStatut = libelleStatutTache;
  protected readonly classeStatut = classeStatutTache;
  protected readonly statuts: StatutTache[] = ['a_faire', 'en_cours', 'terminee'];

  protected readonly enChargement = signal(true);

  constructor() {
    this.tacheService.chargerMesTaches().subscribe({
      next: () => this.enChargement.set(false),
      error: () => {
        this.enChargement.set(false);
        this.snackBar.open('Impossible de charger vos tâches', 'Fermer', { duration: 4000 });
      },
    });
  }

  changerStatut(tache: MaTache, statut: StatutTache): void {
    if (statut === tache.statut) return;

    this.tacheService.modifierStatut(tache.id, statut).subscribe({
      next: () => this.snackBar.open('Statut mis à jour', 'Fermer', { duration: 4000 }),
      error: (err: HttpErrorResponse) => {
        const corps = err.error as ErreurApi | undefined;
        this.snackBar.open(corps?.message ?? 'Impossible de mettre à jour le statut', 'Fermer', {
          duration: 4000,
        });
      },
    });
  }
}
