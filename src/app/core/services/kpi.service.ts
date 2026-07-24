import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { KpisComplets } from '../../models/kpi.model';

@Injectable({ providedIn: 'root' })
export class KpiService {
  private readonly http = inject(HttpClient);

  charger() {
    return this.http
      .get<{ status: 'ok' } & KpisComplets>(`${API_BASE_URL}/kpis`)
      .pipe(
        map(({ synthese, parStatut, parPriorite, enRetard, chargeUtilisateurs }) => ({
          synthese,
          parStatut,
          parPriorite,
          enRetard,
          chargeUtilisateurs,
        }))
      );
  }
}
