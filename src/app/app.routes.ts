import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { CaptchaComponent } from './components/captcha/captcha';
import { ResultComponent } from './components/result/result';
import { captchaCompletionGuard } from './guards/captcha-completion-guard';

/**
 * 🛣️ Configuration des routes de l'application
 *
 * Structure :
 * / → Page d'accueil
 * /captcha → Les 3 étapes du captcha
 * /result → Page de résultats (protégée par guard)
 */
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Captcha Challenge - Accueil'
  },
  {
    path: 'captcha',
    component: CaptchaComponent,
    title: 'Captcha Challenge - En cours'
  },
  {
    path: 'result',
    component: ResultComponent,
    canActivate: [captchaCompletionGuard],  // 🛡️ Protection !
    title: 'Captcha Challenge - Résultats'
  },
  {
    // Route par défaut si URL invalide
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];