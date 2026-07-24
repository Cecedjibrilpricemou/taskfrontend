import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TacheService } from '../../../core/services/tache.service';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { PrioriteTache, StatutTache, TacheListe } from '../../../models/tache.model';
import { classePriorite, classeStatutTache, libellePriorite, libelleStatutTache } from '../../../shared/badges';
import { TacheDialog } from './tache-dialog/tache-dialog';
import { AttributionDialog } from './attribution-dialog/attribution-dialog';
import { ConfirmDialog, DonneesConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-taches',
  imports: [
    DatePipe,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './taches.html',
  styleUrl: './taches.scss',
})
export class Taches {
  protected readonly tacheService = inject(TacheService);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly colonnes = ['titre', 'priorite', 'statut', 'echeance', 'cree_par', 'assignes', 'actions'];
  protected readonly libellePriorite = libellePriorite;
  protected readonly classePriorite = classePriorite;
  protected readonly libelleStatut = libelleStatutTache;
  protected readonly classeStatut = classeStatutTache;

  protected readonly enChargement = signal(true);
  protected readonly filtreStatut = signal<StatutTache | ''>('');
  protected readonly filtrePriorite = signal<PrioriteTache | ''>('');

  protected readonly tachesFiltrees = computed(() => {
    const statut = this.filtreStatut();
    const priorite = this.filtrePriorite();
    return this.tacheService
      .taches()
      .filter((t) => (!statut || t.statut === statut) && (!priorite || t.priorite === priorite));
  });

  constructor() {
    this.charger();
    this.utilisateurService.charger().subscribe();
  }

  private charger(): void {
    this.enChargement.set(true);
    this.tacheService.chargerToutes().subscribe({
      next: () => this.enChargement.set(false),
      error: () => {
        this.enChargement.set(false);
        this.snackBar.open('Impossible de charger les tâches', 'Fermer', { duration: 4000 });
      },
    });
  }

  ouvrirCreation(): void {
    this.dialog
      .open(TacheDialog)
      .afterClosed()
      .subscribe((succes) => {
        if (succes) {
          this.charger();
          this.snackBar.open('Tâche créée avec succès', 'Fermer', { duration: 4000 });
        }
      });
  }

  ouvrirEdition(tache: TacheListe): void {
    this.dialog
      .open(TacheDialog, { data: { tache } })
      .afterClosed()
      .subscribe((succes) => {
        if (succes) {
          this.charger();
          this.snackBar.open('Tâche modifiée avec succès', 'Fermer', { duration: 4000 });
        }
      });
  }

  ouvrirAttribution(tache: TacheListe): void {
    this.dialog
      .open(AttributionDialog, { data: { tache } })
      .afterClosed()
      .subscribe((succes) => {
        if (succes) {
          this.charger();
          this.snackBar.open('Attribution mise à jour', 'Fermer', { duration: 4000 });
        }
      });
  }

  demanderSuppression(tache: TacheListe): void {
    const donnees: DonneesConfirmDialog = {
      titre: 'Supprimer la tâche',
      message: `Confirmer la suppression de « ${tache.titre} » ? Cette action est réversible uniquement par un administrateur en base.`,
      texteConfirmer: 'Supprimer',
      destructif: true,
    };

    this.dialog
      .open(ConfirmDialog, { data: donnees })
      .afterClosed()
      .subscribe((confirme) => {
        if (!confirme) return;

        this.tacheService.supprimer(tache.id).subscribe({
          next: () => this.snackBar.open('Tâche supprimée', 'Fermer', { duration: 4000 }),
          error: () => this.snackBar.open('Impossible de supprimer la tâche', 'Fermer', { duration: 4000 }),
        });
      });
  }
}
