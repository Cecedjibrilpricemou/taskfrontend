# TaskManager — Frontend

Interface Angular pour l'application de gestion de tâches. Deux espaces distincts selon le rôle : **admin** (gestion des utilisateurs, des tâches, tableau de bord) et **utilisateur** (ses tâches attribuées, notifications).

Ce dépôt consomme l'API du backend [`taskbackend`](https://github.com/Cecedjibrilpricemou/taskbackend) — les deux projets sont séparés (pas de monorepo).

## Stack

- **Angular 21** — standalone par défaut, control flow natif (`@if`/`@for`/`@switch`), zoneless (pas de `zone.js`)
- **Angular Material** (Material 3 / thème personnalisé bleu-ardoise, pas le violet par défaut)
- **Reactive Forms** pour tous les formulaires
- **Signals** pour l'état des services et composants
- **ng2-charts** (Chart.js) pour les graphiques du tableau de bord

## Prérequis

- Node.js 20.19+/22.12+/24+ (voir `engines` d'Angular CLI 21)
- Le backend [`taskbackend`](https://github.com/Cecedjibrilpricemou/taskbackend) démarré sur `http://localhost:3000`

## Installation

```bash
npm install
```

## Lancer le projet

```bash
npm start        # ng serve — http://localhost:4200
npm run build    # build de production dans dist/taskfrontend
```

> ⚠️ **Si `ng serve` échoue avec une erreur `EPERM` sur `.angular/cache/.../vite/deps`** (observé sous Windows, probablement l'antivirus qui verrouille le dossier pendant la ré-optimisation des dépendances Vite) : supprime le dossier `.angular/cache` et relance. Ce n'est pas un problème de code — `ng build` (production) n'est jamais affecté.

Si le serveur de dev reste instable, une alternative fiable pour prévisualiser le build de production :

```bash
npm run build
npx serve -s dist/taskfrontend/browser -l 4300
```

## Configuration de l'API

L'URL du backend est définie en dur dans `src/app/core/api-config.ts` :

```typescript
export const API_BASE_URL = 'http://localhost:3000/api';
```

À adapter si le backend tourne ailleurs.

## Architecture

```
src/app/
├── core/
│   ├── api-config.ts          → URL de base de l'API
│   ├── guards/                → authGuard, adminGuard, standardGuard, guestGuard
│   ├── interceptors/          → auth.interceptor.ts (Bearer + redirection 401)
│   └── services/               → un service par domaine (auth, tache, utilisateur, notification, kpi, compte)
├── models/                    → interfaces TypeScript, alignées sur les réponses réelles de l'API
├── layout/shell/               → toolbar + sidenav responsive, partagé par les deux espaces
├── shared/
│   ├── badges.ts               → libellés + classes CSS pour les chips statut/priorité
│   └── components/             → dialogs et composants réutilisables (confirmation, mot de passe, notifications)
└── pages/
    ├── login/
    ├── admin/                   → utilisateurs, taches, tableau-de-bord
    └── app/                     → mes-taches (espace utilisateur standard)
```

### Conventions

- **Aucun `HttpClient` injecté directement dans un composant** : toujours via un service de `core/services/`.
- **Typage strict, pas de `any`** — sauf à la frontière brute d'une réponse HTTP, immédiatement retypée.
- **Noms en français**, cohérents avec le backend (`utilisateur`, `tache`, `statut`...).
- Les interfaces dans `models/` reflètent la forme **réelle** des réponses API (vérifiées avec le backend), pas une convention supposée : par exemple `Utilisateur` (login/me, sans dates) diffère de `UtilisateurListe` (liste admin, avec dates), et `MaTache` (mes-tâches) diffère de `TacheListe` (liste admin globale).

### Sécurité côté frontend

Les gardes de route bloquent l'accès direct par URL, dans les deux sens :
- `adminGuard` : réservé aux comptes `admin`, redirige un utilisateur standard vers `/app`.
- `standardGuard` : réservé aux comptes `utilisateur`, redirige un admin vers `/admin`.

Ce contrôle est un confort UX, pas une mesure de sécurité en soi — l'autorisation réelle est toujours appliquée côté backend (défense en profondeur).

## Fonctionnalités

**Espace admin**
- Utilisateurs : liste, création, changement de statut (actif / bloqué / désactivé)
- Tâches : création, modification, attribution multi-utilisateurs, suppression, filtres par statut/priorité
- Tableau de bord : synthèse, répartition par statut/priorité (graphiques), tâches en retard, charge par utilisateur

**Espace utilisateur standard**
- Mes tâches : liste des tâches attribuées, changement de statut (à faire → en cours → terminée)

**Commun aux deux rôles**
- Notifications in-app (cloche avec badge non-lues)
- Changement de mot de passe personnel

## État du projet

Fonctionnellement complet et testé manuellement de bout en bout (connexion par rôle, guards, CRUD tâches/utilisateurs, attribution, notifications, mot de passe) avec le backend réel — succès et cas d'erreur.

Pas encore fait : tests automatisés (seulement des vérifications manuelles), recherche texte sur la liste des tâches (l'API ne filtre pour l'instant que par statut/priorité).
