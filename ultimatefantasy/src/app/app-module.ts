import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Homepage } from './home/homepage/homepage';
import { Nav } from './nav/nav';
import { Leagecreate } from './league/leaguecreate/leagecreate';
import { CommonModule } from '@angular/common';
import { Myleagues } from './league/myleagues/myleagues';
import { LeaguePage } from './league/league-page/league-page';
import { Sidebar } from './sidebar/sidebar';
import { Draft } from './league/league-components/draft/draft';
import { Standings } from './league/league-components/standings/standings';
import { Rosters } from './league/league-components/rosters/rosters';
import { Schedule } from './league/league-components/schedule/schedule';
import { FreeAgents } from './league/league-components/free-agents/free-agents';
import { PlayerStats } from './league/league-components/player-stats/player-stats';
import { Settings } from './settings/settings';

@NgModule({
  declarations: [
    App,
    Login,
    Signup,
    Homepage,
    Nav,
    Leagecreate,
    Myleagues,
    LeaguePage,
    Sidebar,
    Draft,
    Standings,
    Rosters,
    Schedule,
    FreeAgents,
    PlayerStats,
    Settings,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule, CommonModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [App],
})
export class AppModule {}
