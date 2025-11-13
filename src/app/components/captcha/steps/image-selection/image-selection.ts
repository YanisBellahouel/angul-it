
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaptchaService } from '../../../../services/captcha';
import { ImageChallenge } from '../../../../models/captcha.models';

/**
 * 📸 Étape 1: Sélection d'images
 *
 * L'utilisateur doit sélectionner toutes les images correspondant à la consigne
 */
@Component({
  selector: 'app-image-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-selection.component.html',
  styleUrl: './image-selection.component.scss'
})
export class ImageSelectionComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();

  challenge: ImageChallenge | null = null;
  selectedIndexes: number[] = [];
  showError = false;
  errorMessage = '';

  constructor(private captchaService: CaptchaService) {}

  ngOnInit(): void {
    this.challenge = this.captchaService.getImageChallenge();

    if (!this.challenge) {
      console.error('Aucun challenge image disponible');
    }
  }

  /**
   * 🖱️ Basculer la sélection d'une image
   */
  toggleSelection(index: number): void {
    const position = this.selectedIndexes.indexOf(index);

    if (position === -1) {
      // Ajouter à la sélection
      this.selectedIndexes.push(index);
    } else {
      // Retirer de la sélection
      this.selectedIndexes.splice(position, 1);
    }

    // Cacher le message d'erreur quand l'utilisateur modifie sa sélection
    this.showError = false;
  }

  /**
   * 🎨 Vérifier si une image est sélectionnée
   */
  isSelected(index: number): boolean {
    return this.selectedIndexes.includes(index);
  }

  /**
   * ✅ Valider la sélection
   */
  validate(): void {
    if (this.selectedIndexes.length === 0) {
      this.showError = true;
      this.errorMessage = 'Veuillez sélectionner au moins une image';
      return;
    }

    const isValid = this.captchaService.validateImageStep(this.selectedIndexes);

    if (isValid) {
      // ✅ Succès
      this.showError = false;
      this.completed.emit();
    } else {
      // ❌ Échec
      this.showError = true;
      this.errorMessage = 'Sélection incorrecte. Réessayez !';

      // Réinitialiser la sélection après 1 seconde
      setTimeout(() => {
        this.selectedIndexes = [];
        this.showError = false;
      }, 1500);
    }
  }
}
