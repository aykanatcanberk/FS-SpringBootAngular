import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Signup } from './signup/signup';
import { Login } from './login/login';
import { VerifyEmail } from './verify-email/verify-email';
import { Home } from './user/home/home';
import { authGuard } from './shared/guards/auth-guard';
import { A } from '@angular/cdk/keycodes';
import { adminGuard } from './shared/guards/admin-guard';

const routes: Routes = [
  { path: '', component: Landing },
  { path: 'signup', component: Signup },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'login', component: Login },
  { path: 'home', component: Home , canActivate:[authGuard]},
  { path:'admin',
    loadChildren:()=> import('../app/admin/admin-module').then(m=>m.AdminModule),canActivate:[adminGuard]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
