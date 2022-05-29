import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthenticationService } from './../authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  collapsed = true
  isAuth: boolean = false;
  userSub: Subscription | any;
  user: any;

  constructor(private authService: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe(res => {
      this.isAuth = !!res;
    })
  }

  log() {
    if (!this.isAuth) {
      this.router.navigate(['/authentication']);
    }else {
      this.authService.logOut();
    }
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}
