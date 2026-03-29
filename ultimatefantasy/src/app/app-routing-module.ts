import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { Homepage } from './home/homepage/homepage';
import { Leagecreate } from './league/leaguecreate/leagecreate';
import { LeaguePage } from './league/league-page/league-page';
import { Myleagues } from './league/myleagues/myleagues';
import { Draft } from './league/league-components/draft/draft';
import { FreeAgents } from './league/league-components/free-agents/free-agents';
import { PlayerStats } from './league/league-components/player-stats/player-stats';
import { Rosters } from './league/league-components/rosters/rosters';
import { Schedule } from './league/league-components/schedule/schedule';
import { Standings } from './league/league-components/standings/standings';

const routes: Routes = [
  { path: '', redirectTo: '/homepage', pathMatch: 'full' },
  {
    path: 'league-page/:leagueId',
    component: LeaguePage,
    children: [
      { path: '', redirectTo: 'teams', pathMatch: 'full' },
      { path: 'teams', component: Rosters },
      { path: 'schedule', component: Schedule },
      { path: 'standings', component: Standings },
      { path: 'free-agents', component: FreeAgents },
      { path: 'player-stats', component: PlayerStats },
      { path: 'draft-board', component: Draft },
    ]
  },
  { path: 'create-league', component: Leagecreate },
  { path: 'my-leagues', component: Myleagues },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'homepage', component: Homepage },
  { path: '**', redirectTo: '/homepage' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }