import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Homepage } from './home/homepage/homepage';
import { Leagecreate } from './league/leaguecreate/leagecreate';
import { Leaguejoin } from './league/leaguejoin/leaguejoin';

const routes: Routes = [
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  { path: 'create-league', component: Leagecreate },
  { path: 'join-league', component: Leaguejoin },

  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'homepage', component: Homepage },
  { path: '**', redirectTo: '/login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
