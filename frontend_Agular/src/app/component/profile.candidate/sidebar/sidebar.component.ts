import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../../../../module/Material.module';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ CommonModule,
    MaterialModule,
    RouterOutlet,
    RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  //Sidebar toggle show hide function
  status = false;
  addToggle() {
    this.status = !this.status;
  }
}
