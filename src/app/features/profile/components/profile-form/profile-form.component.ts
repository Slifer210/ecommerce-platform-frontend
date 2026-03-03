import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ProfileApiService } from '../../services/profile-api.service';
import { IdentityDocumentType, Profile } from '../../models/profile.model';
import { ProfileForm } from '../../models/profile.form';
import { AuthState } from '../../../../core/auth/auth.state';
import { CLOUDINARY_CONFIG } from '../../../../core/config/cloudinary.config';

import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.component.html'
})
export class ProfileFormComponent implements OnInit {

  @Input() mode: 'page' | 'modal' = 'page';

  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  documentTypes: IdentityDocumentType[] = [];
  loading = true;
  saving = false;

  form!: FormGroup<ProfileForm>;
  profileImageUrl: string | null = null;

  // config centralizada
  private cloudinary = CLOUDINARY_CONFIG;

  constructor(
    private fb: FormBuilder,
    private profileApi: ProfileApiService,
    private http: HttpClient,
    private authState: AuthState
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group<ProfileForm>({
      fullName: this.fb.control<string | null>(null, {
        validators: [Validators.required]
      }),
      identityDocumentTypeId: this.fb.control<string | null>(null),
      identityDocumentNumber: this.fb.control<string | null>(null),
      phone: this.fb.control<string | null>(null, {
        validators: [Validators.required]
      })
    });

    this.loading = true;

    forkJoin({
      types: this.profileApi.listIdentityDocumentTypes(),
      profile: this.profileApi.getProfile()
    }).subscribe({
      next: ({ types, profile }) => {
        this.documentTypes = types ?? [];
        if (profile) {
          this.patchProfile(profile);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) return;
        if (error.status >= 500) {
          Swal.fire('Error', 'Ocurrió un error del servidor', 'error');
        }

      }
    });
  }

  private patchProfile(profile: Profile): void {

    this.profileImageUrl = profile.profileImageUrl;

    this.form.patchValue({
      fullName: profile.fullName,
      identityDocumentTypeId: profile.identityDocumentType
        ? this.documentTypes.find(t => t.code === profile.identityDocumentType)?.id ?? null
        : null,
      identityDocumentNumber: profile.identityDocumentNumber,
      phone: profile.phone
    });
  }

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.saving) return;

    this.saving = true;

    const value = this.form.getRawValue();

    this.profileApi.updateProfile({
      fullName: value.fullName!.trim(),
      identityDocumentTypeId: value.identityDocumentTypeId,
      identityDocumentNumber: value.identityDocumentNumber,
      phone: value.phone!.trim()
    }).subscribe({
      next: () => {

        this.saving = false;

        // refresca /me
        this.authState.loadUser().subscribe();

        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          timer: 1200,
          showConfirmButton: false
        });

        this.saved.emit();
      },
      error: () => {
        this.saving = false;
        Swal.fire('Error', 'No se pudo guardar el perfil', 'error');
      }
    });
  }

  uploadPhoto(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.cloudinary.uploadPreset);

    this.http.post<any>(
      this.cloudinary.uploadUrl,
      formData
    ).subscribe({
      next: res => {

        const imageUrl = res.secure_url as string;

        this.profileApi.updateProfilePhoto(imageUrl).subscribe(() => {

          this.profileImageUrl = imageUrl;

          // sincroniza header
          this.authState.updateProfileImage(imageUrl);
        });
      }
    });
  }

  get profileProgress(): number {

    let completed = 0;

    if (this.profileImageUrl) completed += 25;
    if (this.form?.controls.fullName?.value?.trim()) completed += 25;
    if (this.form?.controls.phone?.value?.trim()) completed += 25;

    if (
      this.form?.controls.identityDocumentTypeId?.value &&
      this.form?.controls.identityDocumentNumber?.value?.trim()
    ) {
      completed += 25;
    }

    return completed;
  }

  get progressLabel(): string {

    const p = this.profileProgress;

    if (p === 100) return 'Perfil completo';
    if (p >= 75) return 'Casi listo';
    if (p >= 50) return 'A medio camino';
    if (p >= 25) return 'Empezando';

    return 'Perfil incompleto';
  }

  get progressColor(): string {

    const p = this.profileProgress;

    if (p === 100) return 'bg-green-500';
    if (p >= 75) return 'bg-lime-500';
    if (p >= 50) return 'bg-yellow-400';

    return 'bg-red-400';
  }

  cancel(): void {
    this.cancelled.emit();
  }
}