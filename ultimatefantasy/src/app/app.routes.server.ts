import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'league-page/:leagueId',
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/teams',
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/schedule',
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/standings',
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/free-agents',
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/player-stats',
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/draft-board',
    renderMode: RenderMode.Server
  },
  { path: 'league-page/:leagueId/teams/:rosterId', 
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/update-schedule',
    renderMode: RenderMode.Server
  },
  {
    path: 'league-page/:leagueId/trades',
    renderMode: RenderMode.Server
  },
  {
    path: 'my-leagues',
    renderMode: RenderMode.Server
  },
  {
    path: 'create-league',
    renderMode: RenderMode.Server
  },
  {
    path: 'login',
    renderMode: RenderMode.Server
  },
  {
    path: 'signup',
    renderMode: RenderMode.Server
  },
  {
    path: 'homepage',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];