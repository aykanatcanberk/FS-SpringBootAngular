import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth-service';
import { Router } from '@angular/router';
import { NotificationService } from '../shared/services/notification-service';
import { ErrorHandlerService } from '../shared/services/error-handler-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  hide = true
  loginForm !: FormGroup
  loading = false
  showResendLink = false
  userEmail = ''

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectBasedOnRole()
    }
  }

  submit() {
    this.loading = true
    const formData = this.loginForm.value
    const authData = {
      email: formData.email?.trim().toLowerCase(),
      password: formData.password
    }

    this.authService.login(authData).subscribe({
      next: (response: any) => {
        this.loading = false
        this.authService.redirectBasedOnRole()
      },
      error: (err) => {
        this.loading = false
        
        console.log('Login Error Response:', err);

        const backendMessage = err.error?.message || err.error?.error || '';
        
        const displayMsg = backendMessage || 'Login failed. Please check your credentials';

        if (err.status === 403 && backendMessage.toLowerCase().includes('verify')) {
          this.showResendLink = true
          this.userEmail = this.loginForm.value.email
        } else {
          this.showResendLink = false
        }

        this.notificationService.error(displayMsg)
      }
    })
  }

  resendVerification() {
    if (!this.userEmail) {
      this.notificationService.error('Please enter your email address')
      return
    }
    this.showResendLink = false
    this.loading = true
    this.authService.resendVerificationEmail(this.userEmail).subscribe({
      next: (response: any) => {
        this.loading = false
        this.notificationService.success(response.message || 'Verification email sent. Please check your inbox.')
      },
      error: (err) => {
        this.loading = false
        this.errorHandlerService.handle(err, 'Failed to send verification email. Please try again.')
      }
    })
  }

  forgot(){
    this.router.navigate(['/forgot-password'])
  }


}
