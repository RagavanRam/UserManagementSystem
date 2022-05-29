import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  users: User[] | any;
  updatedUsers = new Subject<User[]>()

  constructor() { }

  setUsers(data: User[]) {
    this.users = data;
    this.updatedUsers.next(this.users);
  }

  getUsers() {
    return this.users;
  }

  getUser(index:number) {
    return this.users[index];
  }

}
