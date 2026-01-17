import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, Event } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { DiaolagService } from '../../services/diaolag-service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  @Input() showRouterOutlet: boolean = true;
  currentUser: any = null;
  isAdminMode: boolean = false;
  private routerSubscription: Subscription | null = null;

  constructor(private authService: AuthService,
    private dialogService: DiaolagService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.routerSubscription = this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateMode();
    });

    this.updateMode();
  }

  private updateMode(): void {
    this.isAdminMode = this.router.url.startsWith('/admin');
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN'
  }

  switchMode(): void {
    if (this.isAdminMode) {
      this.router.navigate(['/home'])
    }
    else {
      this.router.navigate(['/admin'])
    }
  }

  openChangePassword() {
    this.dialogService.openChangePasswordDialog()
  }

  logout() {
    this.dialogService.openConfirmation(
      'Logout?',
      'Are you sure want to logout from your account?',
      'Logout',
      'Cancel',
      'warning'
    ).subscribe(result => {
      if (result) {
        this.authService.logout();
      }
    });
  }

}