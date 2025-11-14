
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaptchaService } from '../../../../services/captcha.services';
import { TextChallenge } from '../../../../models/captcha.models';

/**
 * ✍️ Étape 3: Saisie de texte
 *
 * L'utilisateur doit recopier un texte déformé (comme un CAPTCHA classique)
 */
@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss'
})
export class TextInputComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();

  challenge: TextChallenge | null = null;
  userAnswer: string = '';
  showError = false;
  errorMessage = '';

  constructor(private captchaService: CaptchaService) {}

  ngOnInit(): void {
    this.challenge = this.captchaService.getTextChallenge();

    if (!this.challenge) {
      console.error('Aucun challenge texte disponible');
    }
  }

  /**
   * ✅ Valider la saisie
   */
  validate(): void {
    // Vérifier que l'utilisateur a saisi quelque chose
    if (this.userAnswer.trim() === '') {
      this.showError = true;
      this.errorMessage = 'Veuillez entrer le texte affiché';
      return;
    }

    // Valider via le service (case-insensitive)
    const isValid = this.captchaService.validateTextStep(this.userAnswer);

    if (isValid) {
      // ✅ Succès - Dernière étape complétée !
      this.showError = false;
      this.completed.emit();
    } else {
      // ❌ Échec
      this.showError = true;
      this.errorMessage = 'Texte incorrect. Réessayez !';

      // Réinitialiser après 1.5 secondes
      setTimeout(() => {
        this.userAnswer = '';
        this.showError = false;
      }, 1500);
    }
  }

  /**
   * ⌨️ Gérer la touche Entrée
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.validate();
    }
  }

  /**
   * 🔄 Cacher l'erreur quand l'utilisateur tape
   */
  onInputChange(): void {
    this.showError = false;
  }
}