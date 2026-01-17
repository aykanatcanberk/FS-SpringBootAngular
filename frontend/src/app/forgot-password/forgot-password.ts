import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth-service';
import { NotificationService } from '../shared/services/notification-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  forgetPasswordForm !: FormGroup
  loading = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  submit() {
  this.loading = true;
  const email = this.forgetPasswordForm.value.email?.trim().toLowerCase();

  this.authService.forgotPassword(email).subscribe({
    next: (response: any) => {
      this.loading = false;
      this.notification.success(response.message);
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.loading = false;
      this.notification.error(err.error?.error || 'Failed to send reset email. Please try again.');
    }
  });
}
}
