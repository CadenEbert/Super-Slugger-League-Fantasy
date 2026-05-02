import { Component } from '@angular/core';
import { LeagueService } from '../league/league-service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isSidebarOpen = false;

  constructor() {}

  ngOnInit() {

  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    const sidebar = document.querySelector('.sidebar') as HTMLElement;
    if (sidebar) {
      if (this.isSidebarOpen) {
        sidebar.classList.add('open');
      } else {
        sidebar.classList.remove('open');
      }
    }
  }

 
  changeTheme() {
    const body = document.body;
    body.classList.toggle('dark-theme');
  }

  leaveLeague() {
    
    console.log('Leave league clicked');
  }
}
