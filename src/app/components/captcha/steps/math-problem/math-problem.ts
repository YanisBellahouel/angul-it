
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaptchaService } from '../../../../services/captcha';
import { MathChallenge } from '../../../../models/captcha.models';

/**
 * ➗ Étape 2: Problème mathématique
 *
 * L'utilisateur doit résoudre un calcul simple
 */
@Component({
  selector: 'app-math-problem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './math-problem.component.html',
  styleUrl: './math-problem.component.scss'
})
export class MathProblemComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();

  challenge: MathChallenge | null = null;
  userAnswer: string = '';
  showError = false;
  errorMessage = '';

  constructor(private captchaService: CaptchaService) {}

  ngOnInit(): void {
    this.challenge = this.captchaService.getMathChallenge();

    if (!this.challenge) {
      console.error('Aucun challenge math disponible');
    }
  }

  /**
   * ✅ Valider la réponse
   */
  validate(): void {
    // Vérifier que l'utilisateur a saisi quelque chose
    if (this.userAnswer.trim() === '') {
      this.showError = true;
      this.errorMessage = 'Veuillez entrer une réponse';
      return;
    }

    // Convertir en nombre
    const answer = parseInt(this.userAnswer, 10);

    // Vérifier que c'est un nombre valide
    if (isNaN(answer)) {
      this.showError = true;
      this.errorMessage = 'Veuillez entrer un nombre valide';
      return;
    }

    // Valider via le service
    const isValid = this.captchaService.validateMathStep(answer);

    if (isValid) {
      // ✅ Succès
      this.showError = false;
      this.completed.emit();
    } else {
      // ❌ Échec
      this.showError = true;
      this.errorMessage = 'Réponse incorrecte. Réessayez !';

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
