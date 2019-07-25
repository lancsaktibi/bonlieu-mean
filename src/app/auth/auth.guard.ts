import { CanActivate,
         ActivatedRouteSnapshot,
         RouterStateSnapshot,
         Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {

    const isAuth = this.authService.getIsAuth(); // get auth status
    if (!isAuth) {
      // we are not authenticated
      this.router.navigate(['/login']); // redirect to login page
    }
    return isAuth; // if isAuth = true, the route is accessible
  }
}
