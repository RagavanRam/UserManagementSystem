import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';

import { User } from '../shared/user.model';
import { UsersService } from '../shared/users.service';
import { DatabaseService } from '../shared/database.service';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<User[]> {

  constructor(private dbService: DatabaseService, private userService: UsersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const users = this.userService.getUsers();
    if(!users) {
      return this.dbService.fetchUser();
    } else {
        return users;
    }
  }
}
