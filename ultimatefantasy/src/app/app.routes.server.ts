import { RenderMode, ServerRoute } from '@angular/ssr';




export const serverRoutes: ServerRoute[] = [
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
