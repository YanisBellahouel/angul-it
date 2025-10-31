// Types pour les différents challenges
export interface ImageChallenge {
	images: string[];
	correctIndexes: number[];
	instruction: string;
}

export interface MathChallenge {
	question: string;
	answer: number;
}

export interface TextChallenge {
	text: string;
	imageUrl?: string;
}

// État d'une étape
export interface StepState {
	completed: boolean;
	userAnswer: any;
	isCorrect?: boolean;
}

// État global du captcha
export interface CaptchaState {
	currentStep: number;
	imageStep: StepState;
	mathStep: StepState;
	textStep: StepState;
	allCompleted: boolean;
	startTime?: number;
	endTime?: number;
}

// Résultat final
export interface CaptchaResult {
	success: boolean;
	timeTaken: number;
	stepsCompleted: number;
	details: {
		imageChallenge: boolean;
		mathChallenge: boolean;
		textChallenge: boolean;
	};
}