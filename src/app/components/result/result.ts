
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CaptchaService } from '../../services/captcha';
import { CaptchaResult } from '../../models/captcha.models';

/**
 * 🏆 Composant de résultats
 *
 * Affiche les résultats du captcha complété
 * Protégé par le guard (accessible seulement si captcha terminé)
 */
@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent implements OnInit {
  result: CaptchaResult | null = null;

  constructor(
    private captchaService: CaptchaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupérer les résultats
    this.result = this.captchaService.getResults();

    // Double vérification (au cas où le guard aurait raté)
    if (!this.result) {
      console.warn('Aucun résultat disponible, redirection vers /captcha');
      this.router.navigate(['/captcha']);
    }
  }

  /**
   * 🔄 Recommencer un nouveau challenge
   */
  startNewChallenge(): void {
    this.captchaService.reset();
    this.router.navigate(['/captcha']);
  }

  /**
   * 🏠 Retour à l'accueil
   */
  goToHome(): void {
    this.captchaService.reset();
    this.router.navigate(['/']);
  }

  /**
   * ⏱️ Formater le temps en minutes:secondes
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }
}

