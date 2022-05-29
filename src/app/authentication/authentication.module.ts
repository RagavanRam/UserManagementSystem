import { SharedModule } from './../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationComponent } from './authentication.component';



@NgModule({
  declarations: [
    AuthenticationComponent
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgbModule,
    RouterModule.forChild([{path: '', component: AuthenticationComponent}]),
  ]
})
export class AuthenticationModule { }
