import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

import { User } from './user.model';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private http: HttpClient, private userService: UsersService ) { }

  addUser(id: string, user: {name: string, email: string, password: string, role: string}) {
    return this.http.put('https://usermanagementsystemj-default-rtdb.asia-southeast1.firebasedatabase.app/users/'+id+'.json', user).pipe(tap(res => {
      this.fetchUser().subscribe();
    }))
  }

  editUser(id: string, user: {name: string, email: string, password: string, role: string}) {
    return this.http.put('https://usermanagementsystemj-default-rtdb.asia-southeast1.firebasedatabase.app/users/'+id+'.json', user)
  }

  deleteUser(id: string) {
    return this.http.delete('https://usermanagementsystemj-default-rtdb.asia-southeast1.firebasedatabase.app/users/'+id+'.json').
    pipe(tap(res => {
      this.fetchUser().subscribe();
    }))
  }

  getUser(id: string) {
    return this.http.get<{email: string, name: string, password: string, role: string}>('https://usermanagementsystemj-default-rtdb.asia-southeast1.firebasedatabase.app/users/'+id+'.json')
  }

  fetchUser() {
    return this.http.get<User[]>('https://usermanagementsystemj-default-rtdb.asia-southeast1.firebasedatabase.app/users.json').pipe(map(res => {
      const userArray = [];
      for (const key in res) {
        if (res.hasOwnProperty(key)) {
          userArray.push({...res[key], id: key});
        }
      }
      return userArray;
    }), tap(res => {
      this.userService.setUsers(res);
    }))
  }

}
