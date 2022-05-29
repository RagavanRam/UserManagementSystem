import { PasswordPipe } from './password.pipe';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    PasswordPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LoadingSpinnerComponent,
    PasswordPipe,
    CommonModule
  ]
})
export class SharedModule { }
