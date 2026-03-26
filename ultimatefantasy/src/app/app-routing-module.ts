import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Homepage } from './home/homepage/homepage';
import { Leagecreate } from './league/leaguecreate/leagecreate';
import { LeaguePage } from './league/league-page/league-page';
import { Myleagues } from './league/myleagues/myleagues';

const routes: Routes = [
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  { path: 'create-league', component: Leagecreate },
  { path: 'my-leagues', component: Myleagues },
  { path: 'league-page/:leagueId', component: LeaguePage },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'homepage', component: Homepage },
  { path: '**', redirectTo: '/' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
