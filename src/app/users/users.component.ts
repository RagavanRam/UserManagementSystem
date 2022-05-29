import { DatabaseService } from './../shared/database.service';
import { UsersService } from './../shared/users.service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from './../authentication/authentication.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../shared/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] | any;
  role: string | any;
  roleSub: Subscription | any
  alluserSub: Subscription | any;
  email: string | any;

  constructor(private router: Router, private authService: AuthenticationService, private userService: UsersService, private dbService: DatabaseService) { }

  ngOnInit(): void {
    this.email = localStorage.getItem('email');
    this.dbService.fetchUser().subscribe(res => {
      this.users = res;
    })
    this.alluserSub = this.userService.updatedUsers.subscribe(res => {
      this.users = res;
    })
    this.roleSub = this.authService.userRole.subscribe(role => {
      this.role = role;
    });
  }

  toedit(user: User) {
    if(this.role === 'admin' && user.role === 'user') {
      return false;
    }
    if (this.role === 'admin' && user.email === this.email) {
      return false;
    }
    if (this.role === 'superadmin') {
      return false;
    }
    return true;
  }

  todelete(user: User) {
    if(this.role === 'admin' && user.role === 'user') {
      return false;
    }
    if (this.role === 'admin' && user.email === this.email) {
      return false;
    }
    if (this.role === 'superadmin' && user.role === 'superadmin') {
      return true
    }
    if (this.role === 'superadmin') {
      return false;
    }
    return true;
  }


  addUser() {
    this.router.navigate(['/add-user']);
  }

  onEdit(index: number) {
    if (this.role === "admin" || this.role === "superadmin") {
      this.router.navigate(['/edit-user/'+index]);
    }
  }

  onDelete(user: User) {
    if ((this.role === "admin" && user.role !== "admin") || (this.role === "admin" && user.email === this.email)) {
      let token = ''
      let ans = confirm('do you want to delete this user...');
      if (ans) {
        this.authService.getToken(user.email, user.password).subscribe(res => {
          token = res.idToken;
          this.authService.deleteAccount(token).subscribe();
          this.dbService.deleteUser(user.id).subscribe();
        });
      }
      if (user.email === this.email) {
        this.authService.logOut();
      }
    }
    if (this.role === "superadmin" && user.role !== 'superadmin') {
      let token = ''
      let ans = confirm('do you want to delete this user...');
      if (ans) {
        this.authService.getToken(user.email, user.password).subscribe(res => {
          token = res.idToken;
          this.authService.deleteAccount(token).subscribe();
          this.dbService.deleteUser(user.id).subscribe();
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.roleSub) {
      this.roleSub.unsubscribe();
    }
    if (this.alluserSub) {
      this.alluserSub.unsubscribe();
    }
  }
}
