import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CaptchaService } from '../../services/captcha.services';

/**
 * 🏠 Composant de la page d'accueil
 *
 * Première page vue par l'utilisateur
 * Permet de démarrer un nouveau challenge captcha
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    private router: Router,
    private captchaService: CaptchaService
  ) {}

  /**
   * 🚀 Démarrer un nouveau captcha
   * Réinitialise l'état et redirige vers /captcha
   */
  startChallenge(): void {
    this.captchaService.startNewSession();
    this.router.navigate(['/captcha']);
  }
}