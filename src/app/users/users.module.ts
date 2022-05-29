import { SharedModule } from './../shared/shared.module';
import { PasswordPipe } from './../shared/password.pipe';
import { LoadingSpinnerComponent } from './../shared/loading-spinner/loading-spinner.component';
import { RouterModule } from '@angular/router';
import { UsersComponent } from './users.component';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    UsersComponent
  ],
  imports: [
    SharedModule,
    HttpClientModule,
    RouterModule.forChild([{path: '', component: UsersComponent}])
  ]
})
export class UsersModule { }
