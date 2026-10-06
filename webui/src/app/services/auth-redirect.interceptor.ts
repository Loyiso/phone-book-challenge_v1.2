import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authRedirectInterceptor: HttpInterceptorFn = (request, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      const isLoginRequest = request.url.includes('/api/auth/login');

      if (error instanceof HttpErrorResponse && error.status === 401 &&
          !isLoginRequest && isPlatformBrowser(platformId)) {
        localStorage.removeItem('last_cookie_update');
        localStorage.removeItem('user');

        if (router.url !== '/login') {
          void router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};