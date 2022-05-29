import { DatabaseService } from './shared/database.service';
import { AuthenticationService } from './authentication/authentication.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthenticationService, private dbService: DatabaseService) {}

  ngOnInit(): void {
    this.authService.autoLogin();
  }
}
