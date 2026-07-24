import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ErreurApi } from '../../models/api.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly enCours = signal(false);
  readonly erreur = signal<string | null>(null);
  readonly masquerMotDePasse = signal(true);

  readonly formulaire = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required]],
  });

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.erreur.set(null);
    this.enCours.set(true);
    const { email, motDePasse } = this.formulaire.getRawValue();

    this.auth.login(email, motDePasse).subscribe({
      next: () => {
        this.enCours.set(false);
        this.router.navigate([this.auth.isAdmin() ? '/admin' : '/app']);
      },
      error: (err: HttpErrorResponse) => {
        this.enCours.set(false);
        const corps = err.error as ErreurApi | undefined;
        this.erreur.set(corps?.message ?? 'Impossible de se connecter. Réessayez.');
      },
    });
  }
}
