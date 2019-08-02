import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { LanguageService } from '../language/language.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false; // this is the public property to pass over to header
  private authListenerSubs: Subscription; // this is a private property
  private headerLangListenerSubs: Subscription; // to handle lang change
  private defaultLang: string; // used to get default language settings from service
  headerLang: any; // to store language strings

  constructor(private authService: AuthService, private languageService: LanguageService) {}

  ngOnInit() {
    // get initial auth status due to quick load
    this.userIsAuthenticated = this.authService.getIsAuth();

    // set authSubs to the current value from the subscription
    this.authListenerSubs = this.authService.getAuthStatusListener()
      .subscribe(
        isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated; // push private value to public
        }
      );

    // set languageSubs to the current value from the subscription
    this.headerLangListenerSubs = this.languageService.getHeaderLangListener()
      .subscribe(
        headerLang => {
          this.headerLang = headerLang; // load changed values from the service subscription
        }
      );

    // get default language settings from service
    this.languageService.onLang('EN');
  }

  onLogout() {
    // call logout in service.ts to update status
    this.authService.logout();
  }

  onLang(lang: string) {
    // switch language
    this.languageService.onLang(this.headerLang.lang);
    }

  ngOnDestroy() {
      // unsubscribe the service
  this.authListenerSubs.unsubscribe();
  this.headerLangListenerSubs.unsubscribe();
  }
}
