import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CaptchaService } from '../services/captcha.services';

/**
 * 🛡️ Guard qui protège la route /result
 *
 * Empêche l'accès direct à la page de résultats
 * si l'utilisateur n'a pas complété tous les challenges
 */
export const captchaCompletionGuard: CanActivateFn = (route, state) => {
  // 💉 Injection des dépendances (nouvelle syntaxe Angular)
  const captchaService = inject(CaptchaService);
  const router = inject(Router);

  // ✅ Vérifier si tous les challenges sont complétés
  const isCompleted = captchaService.isCompleted();

  if (isCompleted) {
    // ✅ Accès autorisé
    console.log('✅ Captcha complété - Accès à /result autorisé');
    return true;
  } else {
    // ❌ Accès refusé - Redirection vers /captcha
    console.log('❌ Captcha non complété - Redirection vers /captcha');
    return router.createUrlTree(['/captcha']);
  }
};