import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ApiService} from "../services/api.service";
import {Router} from "@angular/router";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  public signupForm!: FormGroup;
  public isSubmitting = false;

  constructor(private formBuilder: FormBuilder, private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required]
    });
  }

  onSubmit(): void {
    console.log('submitting, this.signupForm?.valid:',this.signupForm?.valid);
    if (this.signupForm?.valid) {
      this.isSubmitting = true;
      this.apiService.signup(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.name, this.signupForm.value.surname).pipe(
        tap((success) => {
          this.isSubmitting = false;
          if (success) {
            this.router.navigate(['/']);
          } else {
            console.error('Login failed');
          }
        }),
        catchError((error) => {
          this.isSubmitting = false;
          console.error('An error occurred:', error);
          return of(null);
        })
      ).subscribe();
    }
  }
}
