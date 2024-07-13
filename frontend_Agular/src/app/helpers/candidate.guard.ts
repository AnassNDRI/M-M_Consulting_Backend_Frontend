import { CanActivateFn } from '@angular/router';

export const candidateGuard: CanActivateFn = (route, state) => {
  return true;
};
