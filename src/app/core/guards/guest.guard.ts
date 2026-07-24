import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Empêche un utilisateur déjà connecté de revoir la page de connexion. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estConnecte()) return true;

  router.navigate([auth.isAdmin() ? '/admin' : '/app']);
  return false;
};
