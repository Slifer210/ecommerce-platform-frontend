import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';

@Component({
  standalone: true,
  imports: [CommonModule, ProfileFormComponent],
  template: `
    <div class="max-w-2xl mx-auto py-8">
      <h1 class="text-xl font-semibold mb-6">Mi perfil</h1>
      <app-profile-form mode="page"></app-profile-form>
    </div>
  `
})
export class ProfilePageComponent {}
