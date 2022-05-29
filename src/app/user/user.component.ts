import { DatabaseService } from './../shared/database.service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from './../authentication/authentication.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UsersService } from './../shared/users.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { User } from '../shared/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {

  show = false;
  user: User | any;
  users: User[] | any;
  userIndex: number | any;
  editMode: boolean = false;
  userForm: FormGroup | any;
  role: string = "";
  error: string = "";
  token: string = "";
  userRole: string = "user";
  userSubs: Subscription | any;
  email: string | any;
  private alertTimer: any;

  constructor(private userService: UsersService, private dbService: DatabaseService, private authService: AuthenticationService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.userSubs = this.authService.userRole.subscribe(role => {
      this.userRole = role;
    })
    this.role = localStorage.getItem('role') || "user";
    this.dbService.fetchUser().subscribe(res => {
      this.users = res;
    })
    this.route.params.subscribe(
      {
        next: (params: Params) => {
          this.userIndex = +params['id']
          this.editMode = params['id'] != null;
          if (this.userRole === "user" && this.editMode) {
            this.router.navigate(['/users']);
          }
          this.initForm();
          this.email = localStorage.getItem('email');
          if (this.editMode) {
            if (this.email !== this.user.email || this.userRole === "user") {
              if (this.userRole !== 'superadmin' ) {
              if (this.userRole === 'user' || this.user.role === 'admin' || this.user.role == 'superadmin') {
                this.router.navigate(['users']);
              }
            }
            }
          }
        }
      }
    );
    if (this.editMode) {
      this.authService.getToken(this.user.email, this.user.password).subscribe(res => {
        this.token = res.idToken;
      })
    }
  }

  showPassword() {
    this.show = true;
    let time = setTimeout(() => {
      this.show = false;
      clearTimeout(time);
    }, 1000);
  }

  onSubmit() {
    if (this.editMode) {
      if (this.userForm.untouched ) {
        return;
      }else {
        if (this.userRole === "user") {
          return;
        }else {
        if (!this.error) {
          let newUser = this.userForm.value;
        this.authService.deleteAccount(this.token).subscribe();
        this.authService.signUp(newUser.email, newUser.password, newUser).subscribe({
          next: (res => {
            this.dbService.deleteUser(this.user.id).subscribe(res => {
              alert('user data edited successfully.');
              if (this.user.email === this.email) {
                this.authService.logOut();
              }
              this.alertTimer = setTimeout(() => {
                this.userForm.reset();
                this.onCancel();
                clearTimeout(this.alertTimer);
              }, 500);
            });
          }),
          error: (errorMessage => {
            this.authService.signUp(this.user.email, this.user.password, {...this.user}).subscribe({
              next: (res => {}),
              error: (errorMessage => {
                this.error = errorMessage;
                alert(this.error);
              })
            });
          })
        })
        this.token = "";
        }
        this.error = "";
        }
      }
    }else {
      if (this.userRole === "user") {
        for (let user of this.users) {
          if (user.name === this.userForm.value.name) {
            this.error = "This username already exisits";
            alert(this.error);
            return;
          }
        }
        if (!this.error) {
          this.authService.signUp(this.userForm.value.email, this.userForm.value.password, {...this.userForm.value, role: "user"}).subscribe({
            next: (res => {
              alert('user data added successfully.');
                this.alertTimer = setTimeout(() => {
                  this.userForm.reset();
                  clearTimeout(this.alertTimer);
                }, 500);
            }),
            error: (errorMessage => {
              this.error = errorMessage;
              alert(this.error);
            })
          });
        }
        this.error = "";
      }else {
        for (let user of this.users) {
          if (user.name === this.userForm.value.name) {
            this.error = "This username already exisits";
            alert(this.error);
            return;
          }
        }
        if (!this.error) {
          this.authService.signUp(this.userForm.value.email, this.userForm.value.password, this.userForm.value).subscribe({
            next: (res => {
              alert('user data added successfully.');
                this.alertTimer = setTimeout(() => {
                  this.userForm.reset();
                  clearTimeout(this.alertTimer);
                }, 500);
            }),
            error: (errorMessage => {
              this.error = errorMessage;
              alert(this.error);
            })
          });
        }
        this.error = "";
      }
    }
  }

  onCancel() {
    this.router.navigate(['/users']);
  }

  private initForm() {
    let name = '';
    let password = '';
    let email = '';
    let role = "user";

    if (this.editMode) {
      const user = this.userService.getUser(this.userIndex);
      this.user = user;
      name = user.name;
      password = user.password;
      email = user.email;
      role = user.role;
    }

    this.userForm = new FormGroup({
      name: new FormControl(name, Validators.required),
      password: new FormControl(password, [Validators.required, Validators.minLength(6)]),
      email: new FormControl(email, [Validators.required, Validators.email]),
      role: new FormControl({value: role, disabled: this.role === "user"}, Validators.required)
    })
  }

  ngOnDestroy(): void {
    if (this.userSubs) {
      this.userSubs.unsubscribe();
    }
  }

}
