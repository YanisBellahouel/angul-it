import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CaptchaService } from '../../services/captcha';
import { ImageSelectionComponent } from './steps/image-selection/image-selection';
import { MathProblemComponent } from './steps/math-problem/math-problem';
import { TextInputComponent } from './steps/text-input/text-input';

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [
    CommonModule,
    ImageSelectionComponent,
    MathProblemComponent,
    TextInputComponent
  ],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.scss'
})
export class CaptchaComponent implements OnInit {
  constructor(
    private captchaService: CaptchaService,
    private router: Router
  ) {}

  // ✅ Getters au lieu de propriétés directes
  get currentStep() {
    return this.captchaService.currentStep;
  }

  get progress() {
    return computed(() => {
      const step = this.currentStep();
      return ((step + 1) / 3) * 100;
    });
  }

  ngOnInit(): void {
    if (this.captchaService.isCompleted()) {
      this.router.navigate(['/result']);
    }
  }

  goToPreviousStep(): void {
    this.captchaService.goToPreviousStep();
  }

  goToHome(): void {
    if (confirm('Voulez-vous vraiment abandonner ? Votre progression sera perdue.')) {
      this.captchaService.reset();
      this.router.navigate(['/']);
    }
  }

  onStepCompleted(): void {
    const currentStep = this.currentStep();

    if (currentStep < 2) {
      this.captchaService.goToNextStep();
    } else {
      this.router.navigate(['/result']);
    }
  }

  getStepStatus(stepIndex: number): 'completed' | 'current' | 'pending' {
    const current = this.currentStep();
    const state = this.captchaService.getCurrentState();

    if (stepIndex === 0 && state.imageStep.completed) return 'completed';
    if (stepIndex === 1 && state.mathStep.completed) return 'completed';
    if (stepIndex === 2 && state.textStep.completed) return 'completed';

    if (stepIndex === current) return 'current';
    return 'pending';
  }
}