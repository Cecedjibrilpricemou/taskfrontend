import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { KpiService } from '../../../core/services/kpi.service';
import { KpisComplets } from '../../../models/kpi.model';
import { classePriorite, libellePriorite, libelleStatutTache } from '../../../shared/badges';

@Component({
  selector: 'app-tableau-de-bord',
  imports: [
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    BaseChartDirective,
  ],
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.scss',
})
export class TableauDeBord {
  private readonly kpiService = inject(KpiService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly libellePriorite = libellePriorite;
  protected readonly classePriorite = classePriorite;
  protected readonly libelleStatut = libelleStatutTache;

  protected readonly enChargement = signal(true);
  protected readonly kpis = signal<KpisComplets | null>(null);

  protected readonly tauxCompletion = computed(() => {
    const k = this.kpis();
    if (!k || k.synthese.total_taches === 0) return 0;
    return Math.round((k.synthese.taches_terminees / k.synthese.total_taches) * 100);
  });

  protected readonly chargeMax = computed(() => {
    const k = this.kpis();
    if (!k || k.chargeUtilisateurs.length === 0) return 1;
    return Math.max(1, ...k.chargeUtilisateurs.map((c) => c.nb_taches_actives));
  });

  protected readonly donneesStatut = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const k = this.kpis();
    const items = k?.parStatut ?? [];
    return {
      labels: items.map((i) => this.libelleStatut(i.statut)),
      datasets: [
        {
          data: items.map((i) => i.total),
          backgroundColor: ['#8e97a8', '#3f66d4', '#2c8a4b'],
        },
      ],
    };
  });

  protected readonly donneesPriorite = computed<ChartConfiguration<'bar'>['data']>(() => {
    const k = this.kpis();
    const items = k?.parPriorite ?? [];
    return {
      labels: items.map((i) => this.libellePriorite(i.priorite)),
      datasets: [
        {
          label: 'Tâches',
          data: items.map((i) => i.total),
          backgroundColor: '#3f51b5',
          borderRadius: 6,
        },
      ],
    };
  });

  protected readonly optionsBar: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  protected readonly optionsDoughnut: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  constructor() {
    this.kpiService.charger().subscribe({
      next: (k) => {
        this.kpis.set(k);
        this.enChargement.set(false);
      },
      error: () => {
        this.enChargement.set(false);
        this.snackBar.open('Impossible de charger les KPIs', 'Fermer', { duration: 4000 });
      },
    });
  }
}
