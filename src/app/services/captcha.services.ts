import { Injectable, signal, computed } from '@angular/core';
import {
  CaptchaState,
  ImageChallenge,
  MathChallenge,
  TextChallenge,
  CaptchaResult,
  StepState
} from '../models/captcha.models';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  // 🔑 Clés pour localStorage
  private readonly STORAGE_KEY = 'captcha_state';
  private readonly CHALLENGES_KEY = 'captcha_challenges';

  // 📊 État initial
  private readonly initialState: CaptchaState = {
    currentStep: 0,
    imageStep: { completed: false, userAnswer: null },
    mathStep: { completed: false, userAnswer: null },
    textStep: { completed: false, userAnswer: null },
    allCompleted: false,
    startTime: undefined,
    endTime: undefined
  };

  // 🎯 Signal réactif pour l'état (remplace BehaviorSubject)
  private state = signal<CaptchaState>(this.loadStateFromStorage());

  // 📖 Signals computed (lecture seule)
  public currentStep = computed(() => this.state().currentStep);
  public isCompleted = computed(() => this.state().allCompleted);
  public canGoToResult = computed(() => this.state().allCompleted);

  // 🎲 Challenges générés (sauvegardés dans localStorage)
  private imageChallenge: ImageChallenge | null = null;
  private mathChallenge: MathChallenge | null = null;
  private textChallenge: TextChallenge | null = null;

  constructor() {
    // Charger les challenges depuis localStorage
    this.loadChallengesFromStorage();

    // Si pas de state sauvegardé, démarrer une nouvelle session
    if (!this.state().startTime) {
      this.startNewSession();
    }
  }

  // 🆕 Démarrer une nouvelle session
  startNewSession(): void {
    const newState = {
      ...this.initialState,
      startTime: Date.now()
    };
    this.state.set(newState);
    this.saveStateToStorage();

    // Générer les nouveaux challenges
    this.generateChallenges();
  }

  // 🎲 Générer tous les challenges
  private generateChallenges(): void {
    this.imageChallenge = this.generateImageChallenge();
    this.mathChallenge = this.generateMathChallenge();
    this.textChallenge = this.generateTextChallenge();

    // Sauvegarder les challenges
    this.saveChallenges();
  }

  // 📸 Générer le challenge image
  private generateImageChallenge(): ImageChallenge {
    const categories = [
      { name: 'voitures', images: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒'] },
      { name: 'animaux', images: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨'] },
      { name: 'fruits', images: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒'] }
    ];

    const category = categories[Math.floor(Math.random() * categories.length)];
    const allEmojis = ['🚗', '🐶', '🍎', '🏠', '⚽', '📱', '🎵', '⭐', '🌙', '☀️', '🌈', '🔥'];

    // Mélanger et prendre 9 images
    const shuffled = [...allEmojis].sort(() => Math.random() - 0.5);
    const selectedImages = shuffled.slice(0, 9);

    // Insérer quelques images de la catégorie choisie
    const correctCount = 2 + Math.floor(Math.random() * 2); // 2-3 images correctes
    const correctIndexes: number[] = [];

    for (let i = 0; i < correctCount; i++) {
      const randomIndex = Math.floor(Math.random() * 9);
      if (!correctIndexes.includes(randomIndex)) {
        selectedImages[randomIndex] = category.images[Math.floor(Math.random() * category.images.length)];
        correctIndexes.push(randomIndex);
      }
    }

    return {
      images: selectedImages,
      correctIndexes: correctIndexes.sort((a, b) => a - b),
      instruction: `Sélectionnez tous les ${category.name}`
    };
  }

  // ➗ Générer le challenge math
  private generateMathChallenge(): MathChallenge {
    const operations = [
      { op: '+', calc: (a: number, b: number) => a + b },
      { op: '-', calc: (a: number, b: number) => a - b },
      { op: '×', calc: (a: number, b: number) => a * b }
    ];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const answer = operation.calc(a, b);

    return {
      question: `${a} ${operation.op} ${b} = ?`,
      answer: answer
    };
  }

  // ✍️ Générer le challenge texte
  private generateTextChallenge(): TextChallenge {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 (confusion)
    let text = '';
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return { text };
  }

  // 📖 Récupérer les challenges (getters)
  getImageChallenge(): ImageChallenge | null {
    return this.imageChallenge;
  }

  getMathChallenge(): MathChallenge | null {
    return this.mathChallenge;
  }

  getTextChallenge(): TextChallenge | null {
    return this.textChallenge;
  }

  // ✅ Valider la réponse de l'étape image
  validateImageStep(selectedIndexes: number[]): boolean {
    if (!this.imageChallenge) return false;

    const correct = JSON.stringify(selectedIndexes.sort()) ===
                   JSON.stringify(this.imageChallenge.correctIndexes.sort());

    this.updateStepState('imageStep', selectedIndexes, correct);
    return correct;
  }

  // ✅ Valider la réponse de l'étape math
  validateMathStep(answer: number): boolean {
    if (!this.mathChallenge) return false;

    const correct = answer === this.mathChallenge.answer;
    this.updateStepState('mathStep', answer, correct);
    return correct;
  }

  // ✅ Valider la réponse de l'étape texte
  validateTextStep(answer: string): boolean {
    if (!this.textChallenge) return false;

    const correct = answer.toUpperCase() === this.textChallenge.text.toUpperCase();
    this.updateStepState('textStep', answer, correct);
    return correct;
  }

  // 🔄 Mettre à jour l'état d'une étape
  private updateStepState(step: 'imageStep' | 'mathStep' | 'textStep', answer: any, isCorrect: boolean): void {
    const currentState = this.state();
    const updatedState = {
      ...currentState,
      [step]: {
        completed: isCorrect,
        userAnswer: answer,
        isCorrect: isCorrect
      }
    };

    // Vérifier si toutes les étapes sont complétées
    const allCompleted =
      updatedState.imageStep.completed &&
      updatedState.mathStep.completed &&
      updatedState.textStep.completed;

    if (allCompleted && !currentState.allCompleted) {
      updatedState.allCompleted = true;
      updatedState.endTime = Date.now();
    }

    this.state.set(updatedState);
    this.saveStateToStorage();
  }

  // ➡️ Passer à l'étape suivante
  goToNextStep(): void {
    const currentState = this.state();
    if (currentState.currentStep < 2) {
      this.state.set({
        ...currentState,
        currentStep: currentState.currentStep + 1
      });
      this.saveStateToStorage();
    }
  }

  // ⬅️ Revenir à l'étape précédente
  goToPreviousStep(): void {
    const currentState = this.state();
    if (currentState.currentStep > 0) {
      this.state.set({
        ...currentState,
        currentStep: currentState.currentStep - 1
      });
      this.saveStateToStorage();
    }
  }

  // 🔢 Aller à une étape spécifique
  goToStep(step: number): void {
    if (step >= 0 && step <= 2) {
      const currentState = this.state();
      this.state.set({
        ...currentState,
        currentStep: step
      });
      this.saveStateToStorage();
    }
  }

  // 📊 Obtenir les résultats finaux
  getResults(): CaptchaResult | null {
    const currentState = this.state();

    if (!currentState.allCompleted) {
      return null;
    }

    const timeTaken = currentState.endTime && currentState.startTime
      ? Math.round((currentState.endTime - currentState.startTime) / 1000)
      : 0;

    return {
      success: currentState.allCompleted,
      timeTaken: timeTaken,
      stepsCompleted: 3,
      details: {
        imageChallenge: currentState.imageStep.completed,
        mathChallenge: currentState.mathStep.completed,
        textChallenge: currentState.textStep.completed
      }
    };
  }

  // 💾 Sauvegarder dans localStorage
  private saveStateToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state()));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  // 📖 Charger depuis localStorage
  private loadStateFromStorage(): CaptchaState {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
    return this.initialState;
  }

  // 💾 Sauvegarder les challenges
  private saveChallenges(): void {
    try {
      const challenges = {
        image: this.imageChallenge,
        math: this.mathChallenge,
        text: this.textChallenge
      };
      localStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des challenges:', error);
    }
  }

  // 📖 Charger les challenges
  private loadChallengesFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.CHALLENGES_KEY);
      if (saved) {
        const challenges = JSON.parse(saved);
        this.imageChallenge = challenges.image;
        this.mathChallenge = challenges.math;
        this.textChallenge = challenges.text;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des challenges:', error);
    }
  }

  // 🗑️ Réinitialiser tout
  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CHALLENGES_KEY);
    this.startNewSession();
  }

  // 📊 Obtenir l'état actuel (pour debug)
  getCurrentState(): CaptchaState {
    return this.state();
  }
}