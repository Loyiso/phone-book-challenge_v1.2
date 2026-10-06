import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile-management.component.html',
  styleUrl: './profile-management.component.scss'
})
export class ProfileManagementComponent implements OnInit {
  public updateMyProfileForm!: FormGroup;
  public updatePasswordForm!: FormGroup;
  public isLoadingProfile = false;
  public isSavingProfile = false;
  public isSavingPassword = false;
  public profileError = '';
  public profileSuccess = '';
  public passwordError = '';
  public passwordSuccess = '';

  constructor(private formBuilder: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.updateMyProfileForm = this.formBuilder.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
    this.updatePasswordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });

    this.loadProfile();
  }

  updateProfile(): void {
    if (this.updateMyProfileForm.invalid || this.isSavingProfile) {
      this.updateMyProfileForm.markAllAsTouched();
      return;
    }

    this.profileError = '';
    this.profileSuccess = '';
    this.isSavingProfile = true;
    const { name, surname, email } = this.updateMyProfileForm.getRawValue();

    this.apiService.updateProfile(name, surname, email).subscribe({
      next: profile => {
        this.updateMyProfileForm.patchValue(profile);
        this.profileSuccess = 'Profile updated successfully.';
        this.isSavingProfile = false;
      },
      error: error => {
        this.profileError = this.getErrorMessage(error, 'Unable to update your profile.');
        this.isSavingProfile = false;
      }
    });
  }

  updatePassword(): void {
    if (this.updatePasswordForm.invalid || this.isSavingPassword) {
      this.updatePasswordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.updatePasswordForm.getRawValue();
    this.passwordError = '';
    this.passwordSuccess = '';

    if (newPassword !== confirmPassword) {
      this.passwordError = 'New password and confirmation do not match.';
      return;
    }

    this.isSavingPassword = true;
    this.apiService.updatePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: () => {
        this.passwordSuccess = 'Password updated successfully.';
        this.updatePasswordForm.reset();
        this.isSavingPassword = false;
      },
      error: error => {
        this.passwordError = this.getErrorMessage(error, 'Unable to update your password.');
        this.isSavingPassword = false;
      }
    });
  }

  private loadProfile(): void {
    this.isLoadingProfile = true;
    this.profileError = '';

    this.apiService.getProfile().subscribe({
      next: profile => {
        this.updateMyProfileForm.patchValue(profile);
        this.isLoadingProfile = false;
      },
      error: error => {
        this.profileError = this.getErrorMessage(error, 'Unable to load your profile.');
        this.isLoadingProfile = false;
      }
    });
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }
    }

    return fallback;
  }
}
