import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: false,
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  isSettingsOpen = false;
  positions: any[] = [];
  players: any[] = [];

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  addPlayer() {
    this.players.push({ name: '', position: '' });
  }
}
