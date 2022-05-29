import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';

import { LoginUser } from './login-user.model';
import { DatabaseService } from './../shared/database.service';

export interface authResponseData {
  kind?: string,
  idToken: string,
  email: string,
  refreshToken: string,
  expiresIn: string,
  localId: string,
  registered?: boolean,
}

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  user = new BehaviorSubject<LoginUser | any>(null);
  userRole = new BehaviorSubject<string>("user");
  private Timer: any;

  constructor(private http: HttpClient, private dbService: DatabaseService, private router: Router) { }

  signUp(email: string, password: string, user: {name: string, email: string, password: string, role: string}) {
    return this.http.post<authResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCUwUH-gBIpjnf07ExpyqOlOy3KaksJIa0', {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(tap( res => {
      let newUser = user;
      this.dbService.addUser(res.localId, newUser).subscribe();
    }), catchError(err => this.handleError(err)))
  }

  deleteAccount(token: string) {
    return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:delete?key=AIzaSyCUwUH-gBIpjnf07ExpyqOlOy3KaksJIa0', {
      idToken: token
    })
  }

  logIn(email: string, password: string) {
    return this.http.post<authResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCUwUH-gBIpjnf07ExpyqOlOy3KaksJIa0', {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(tap(res => this.handleAuthentication(res.email, res.localId, res.idToken, +res.expiresIn)), catchError(err => this.handleError(err)))
  }

  getToken(email: string, password: string) {
    return this.http.post<authResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCUwUH-gBIpjnf07ExpyqOlOy3KaksJIa0', {
      email: email,
      password: password,
      returnSecureToken: true
    })
  }

  autoLogin() {
    var userData = localStorage.getItem('userData');
    const user: {
      email: string,
      id: string,
      _token: string,
      _tokenExpirationDate: string
    } = JSON.parse(userData || "null");

    if (!userData) {
      return;
    }

    const loadedUser = new LoginUser(user.email, user.id, user._token, new Date(user._tokenExpirationDate));
    if (loadedUser.token) {
      this.dbService.getUser(loadedUser.id).subscribe(res => {
        this.userRole.next(res.role);
      })
      this.user.next(loadedUser);
    }

    const expirationTimer = new Date(user._tokenExpirationDate).getTime() - new Date().getTime();
    this.autoLogout(expirationTimer);
  }

  autoLogout(expirationTime: number) {
    this.Timer = setTimeout(() => {
      this.logOut();
    }, expirationTime);
  }

  logOut() {
    this.user.next(null);
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    this.userRole.next("user");
    this.router.navigate(['/users']);
    localStorage.removeItem('userData');
    if (this.Timer) {
      clearTimeout(this.Timer);
    }
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    this.dbService.getUser(userId).subscribe(res => {
      localStorage.setItem('role', res.role);
      this.userRole.next(res.role);
    })
    const user = new LoginUser(email, userId, token, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
    localStorage.setItem('email', user.email);
  }

  private handleError(errorResponse: HttpErrorResponse) {
      let errorMessage = 'An unknown error occurred...!';
      if (!errorResponse.error || !errorResponse.error.error) {
        return throwError(() => errorMessage);
      }
      switch (errorResponse.error.error.message) {
        case 'EMAIL_NOT_FOUND' :
          errorMessage = 'This email does not exist';
        break;

        case 'INVALID_PASSWORD' :
          errorMessage = 'This password is not correct';
        break;

        case 'USER_DISABLED' :
          errorMessage = 'The user account has been disabled by an administrator';
        break;

        case 'EMAIL_EXISTS' :
          errorMessage = 'This email exists already';
        break;

        case 'OPERATION_NOT_ALLOWED' :
          errorMessage = 'Password sign-in is disabled for this project';
        break;

        case 'TOO_MANY_ATTEMPTS_TRY_LATER' :
          errorMessage = 'We have blocked all requests from this device due to unusual activity. Try again later.';
        break;

        case 'NVALID_ID_TOKEN' :
          errorMessage = "The user's credential is no longer valid. The user must sign in again.";
        break;
      }
      return throwError(() => errorMessage);
  }
}
