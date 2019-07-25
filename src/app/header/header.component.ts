import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false; // this is the public property to pass over to header
  private authListenerSubs: Subscription; // this is a private property

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // get initial auth status due to quick load
    this.userIsAuthenticated = this.authService.getIsAuth();

    // set Subs to the current value from the subscription
    this.authListenerSubs = this.authService.getAuthStatusListener()
      .subscribe(
        isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated; // push private value to public
        }
      );
  }

  onLogout() {
    // call logout in service.ts to update status
    this.authService.logout();
  }

  ngOnDestroy() {
      // unsubscribe the service
  this.authListenerSubs.unsubscribe();
  }
}
