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

import { Myleagues } from './league/myleagues/myleagues';
import { LeaguePage } from './league/league-page/league-page';
import { Sidebar } from './sidebar/sidebar';

@NgModule({
  declarations: [App, Login, Signup, Homepage, Nav, Leagecreate, Myleagues, LeaguePage, Sidebar],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [App],
})
export class AppModule {}
