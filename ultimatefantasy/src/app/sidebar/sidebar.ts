import { Component } from '@angular/core';
import { SidebarService } from './service/sidebar-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isSidebarOpen = false;

  constructor(public sidebarService: SidebarService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.sidebarService.loadSideBar(this.route.snapshot.params['leagueId']);
    console.log(this.route.snapshot.params['leagueId']);


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


}
