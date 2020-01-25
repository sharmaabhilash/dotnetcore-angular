import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { AlertifyService } from '../_services/alertify.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, 
    private authService: AuthenticationService,
    private alertify: AlertifyService) { }

  canActivate(): boolean {
    if(this.authService.loggedIn()) {
      return true;
    }
    
    this.alertify.error('Unauthorized access');
    this.router.navigate(['/home']);
    return false;
  }
  
}
