import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  loginModel: any = {};
  photoUrl: string;

  constructor(public authService: AuthenticationService, 
    private alertify: AlertifyService,
    private router: Router) { }

  ngOnInit() {
    this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
  }

  loginUser() {
    this.authService.loginUser(this.loginModel).subscribe(next => {
      this.alertify.success("Logged in successfully");
    }, error => {
      this.alertify.error(error);
    }, () => {
      this.router.navigate(['/members']);
    })
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  loggedOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.authService.decodeToken = null;
    this.authService.currentUser = null;
    this.alertify.message('Logged out');
    this.router.navigate(['/home']);
  }
}
