import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../_models/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private jwtHelper = new JwtHelperService();
  public decodeToken: any;
  public currentUser: User;
  photoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentPhotoUrl = this.photoUrl.asObservable();

  constructor(private http: HttpClient) { }

  loginUser(loginModel: any) {

    let url = environment.baseUrl + environment.loginUrl;

    return this.http.post(url, loginModel)
      .pipe(map((response: any) => {
        const user = response;
        if(user) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user.user));
          this.currentUser = user.user;
          this.decodeToken = this.jwtHelper.decodeToken(user.token);
          this.changeMemberPhoto(this.currentUser.photoUrl);
        }
      })
    );
  }

  registerUser(registerModel: User) {

    let url = environment.baseUrl + environment.registerUrl;

    return this.http.post(url, registerModel);
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  changeMemberPhoto(photoUrl: string) {
    this.photoUrl.next(photoUrl);
  }
}
