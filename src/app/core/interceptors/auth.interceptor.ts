import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // withCredentials une fois pour toutes ici plutôt que sur chaque appel :
  // c'est ce qui permet au navigateur d'envoyer le cookie httpOnly de
  // session vers l'API.
  const requete = req.clone({ withCredentials: true });

  return next(requete).pipe(
    catchError((erreur: HttpErrorResponse) => {
      if (erreur.status === 401 && auth.estConnecte()) {
        auth.reinitialiserSessionExpiree();
        router.navigate(['/login']);
      }
      return throwError(() => erreur);
    })
  );
};
