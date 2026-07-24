import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api-config';

@Injectable({ providedIn: 'root' })
export class CompteService {
  private readonly http = inject(HttpClient);

  changerMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string) {
    return this.http.patch<{ status: 'ok'; message: string }>(
      `${API_BASE_URL}/auth/mot-de-passe`,
      { ancienMotDePasse, nouveauMotDePasse }
    );
  }
}
