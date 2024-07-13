import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../module/Material.module';

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [RouterLink, MaterialModule, FormsModule, TranslateModule],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css',
})
export class RoleComponent {
  constructor(private router: Router) {}

  navigateToCandidateProfile(): void {
    this.router.navigate(['/register-candidate']);
  }
  navigateToRecruiterProfile(): void {
    this.router.navigate(['/register-recruiter']);
  }
}
