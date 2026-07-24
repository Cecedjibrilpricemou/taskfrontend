import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Réservé aux comptes de rôle "utilisateur" -- un admin est redirigé vers son propre espace. */
export const standardGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estConnecte()) {
    router.navigate(['/login']);
    return false;
  }
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};
