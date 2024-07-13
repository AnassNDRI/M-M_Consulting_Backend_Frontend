import { CanActivateFn } from '@angular/router';

export const recruiterGuard: CanActivateFn = (route, state) => {
  return true;
};
