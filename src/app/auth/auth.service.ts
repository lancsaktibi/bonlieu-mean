import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthData } from './auth-data.model';



// global variable for url
const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false; // to store auth status
  // global variable to store token
  private token: string;
  private tokenTimer: any; // variable for token expiration
  private userId: string; // variable for user ID from the backend
  // auth status listener to push status across modules (true false)
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router) {}

  // provide token to post services
  getToken() {
    return this.token;
  }

  // spread initial status for post-list (listener only sends data on auth changes)
  getIsAuth() {
    return this.isAuthenticated;
  }

  // spread userID across the app for post list
  getUserId() {
    return this.userId;
  }

  // return authStatus as observable for other modules
  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  // signup
  createUser(email: string, password: string) {
    const authData: AuthData = {email, password};
    this.http.post(BACKEND_URL + 'signup', authData)
      .subscribe(response => {
      });
  }

  // login
  login(email: string, password: string) {
    const authData: AuthData = {email, password};
    this.http.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL + 'login', authData)
      .subscribe(response => {
        const token = response.token; // get the token value from the response
        this.token = token; // store token in the service
        if (token) {
          // if we have a valid token
          const expiresInDuration = response.expiresIn; // expiration info from backend
          this.setAuthTimer(expiresInDuration); // call separated authTimer method
          this.isAuthenticated = true; // set initial status to true
          this.userId = response.userId; // pick userId from backend response
          this.authStatusListener.next(true); // set authStatus to true and spread across the app

          // create expiration date
          const now = new Date();
          // create expiration timestamp in date format
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

          this.saveAuthData(token, expirationDate, this.userId); // save token to local storage
          this.router.navigate(['/']); // redirect to main page
        }
      });
  }

  // authenticate user from the local storage
  autoAuthUser() {
    const authInformation = this.getAuthData(); // read data from local storage
    if (!authInformation) {
      return; // if user is not logged in, dont set auth status
    }
    const now = new Date(); // query current date
    // calculate remaining token time in ms
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token; // add token to reply package
      this.isAuthenticated = true;
      this.userId = authInformation.userId; // add userId
      this.setAuthTimer(expiresIn / 1000); // set expiration timer (works with seconds)
      this.authStatusListener.next(true); // spread info across the app
    }
  }

  logout() {
    this.token = null; // clear token
    this.isAuthenticated = false; // set status to false
    this.authStatusListener.next(false); // set authStatus to false and spread across the app
    this.userId = null; // clear userId
    clearTimeout(this.tokenTimer); // clear timer
    this.clearAuthData(); // clear token from local storage
    this.router.navigate(['/']); // redirect to main page
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout(); // call logout on expiration
    }, duration * 1000); // node.js timeout() with expiry function & timing in ms
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString()); // standardized format
    localStorage.setItem('userId', userId); // store userId
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    // check whether we have got the data from localstorage
    if (!token || !expirationDate) {
      return;
    }
    // if we have it, send it back -- date in the right format
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId
    };
  }
}
