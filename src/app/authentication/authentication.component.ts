import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { DatabaseService } from './../shared/database.service';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit, OnDestroy {

  show = false;
  isLoading: boolean = false;
  LoginForm: FormGroup | any;
  error: string = '';
  userSub: Subscription | any;

  constructor(private router: Router, private dbService: DatabaseService, private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.initLoginForm();
    this.userSub = this.authService.user.subscribe(user => {
      if (user) {
        this.router.navigate(['/users']);
      }
    })
  }

  onSubmit() {
    if (!this.LoginForm.valid) {
      return;
    }

    const email = this.LoginForm.value.email
    const password = this.LoginForm.value.password

    this.isLoading = true;

    this.authService.logIn(email, password).subscribe(
      {
        next: res => {
          this.isLoading = false;
          this.router.navigate(['./users']);
        },
        error: errorMessage => {
          this.error = errorMessage;
          this.isLoading = false;
        }
      }
    )

    this.LoginForm.reset();
  }

  close() {
    this.error = ''
  }

  showPassword() {
    this.show = true;
    let time = setTimeout(() => {
      this.show = false;
      clearTimeout(time);
    }, 1000);
  }

  onCancel() {
    this.router.navigate(['/users'])
  }

  private initLoginForm() {
      this.LoginForm = new FormGroup({
        email : new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

}
