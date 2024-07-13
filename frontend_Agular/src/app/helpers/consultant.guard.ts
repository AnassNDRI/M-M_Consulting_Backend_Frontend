import { CanActivateFn } from '@angular/router';

export const consultantGuard: CanActivateFn = (route, state) => {

  return true;
};
