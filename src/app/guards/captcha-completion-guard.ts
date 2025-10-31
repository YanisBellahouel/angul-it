import { CanActivateFn } from '@angular/router';

export const captchaCompletionGuard: CanActivateFn = (route, state) => {
  return true;
};
