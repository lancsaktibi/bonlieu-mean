import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/language/language.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;
  private authLangListenerSubs: Subscription; // to handle lang change
  authLang: any; // to store language string

  constructor(public authService: AuthService, private languageService: LanguageService) {}

  ngOnInit() {
    // check authStatus
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false; // if status false, set spinner to false
      }
    );

    // set languageSubs to the current value from the subscription
    this.authLangListenerSubs = this.languageService.getauthLangListener()
    .subscribe(
      authLang => {
        this.authLang = authLang; // load values from the service subscription
      }
    );

    // get default language settings from service
    this.languageService.onLang('EN');
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true; // show spinner
    this.authService.createUser(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.authLangListenerSubs.unsubscribe();
  }
}
