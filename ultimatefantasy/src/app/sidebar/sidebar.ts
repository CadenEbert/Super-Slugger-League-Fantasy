import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isSidebarOpen = false;

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
    // Implement logic to leave the league, e.g., call a service method
    console.log('Leave league clicked');
  }
}
