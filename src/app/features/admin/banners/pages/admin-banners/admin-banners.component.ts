import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AlertService } from '../../../../../core/services/alert.service';
import { CLOUDINARY_CONFIG } from '../../../../../core/config/cloudinary.config';
import {
  AdminBanner,
  AdminBannerRequest
} from '../../models/admin-banner.model';
import { AdminBannerService } from '../../services/admin-banner.service';

type UploadTarget = 'desktop' | 'mobile';

interface BannerFormValue {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageUrlMobile: string;
  ctaLabel: string;
  ctaUrl: string;
  displayOrder: number;
  isActive: boolean;
  startAt: string;
  endAt: string;
}

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-banners.component.html'
})
export class AdminBannersComponent implements OnInit {
  banners: AdminBanner[] = [];
  editingBanner: AdminBanner | null = null;

  loading = false;
  saving = false;
  reordering = false;
  uploadingDesktop = false;
  uploadingMobile = false;

  form: BannerFormValue = this.createEmptyForm();

  private readonly cloudinary = CLOUDINARY_CONFIG;

  constructor(
    private http: HttpClient,
    private adminBannerService: AdminBannerService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get isEditing(): boolean {
    return !!this.editingBanner;
  }

  load(): void {
    this.loading = true;

    this.adminBannerService.list().subscribe({
      next: banners => {
        this.banners = (banners ?? []).sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: error => {
        this.loading = false;

        if (error.status === 401) return;

        this.alert.error('No se pudieron cargar los banners');
      }
    });
  }

  edit(banner: AdminBanner): void {
    this.editingBanner = banner;
    this.form = {
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      imageUrl: banner.imageUrl,
      imageUrlMobile: banner.imageUrlMobile ?? '',
      ctaLabel: banner.ctaLabel ?? '',
      ctaUrl: banner.ctaUrl ?? '',
      displayOrder: banner.displayOrder,
      isActive: banner.isActive,
      startAt: this.toDateTimeLocalValue(banner.startAt),
      endAt: this.toDateTimeLocalValue(banner.endAt)
    };

    const container = document.querySelector('main');
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.editingBanner = null;
    this.form = this.createEmptyForm();
  }

  submit(): void {
    if (!this.form.title.trim() || !this.form.imageUrl.trim()) {
      this.alert.error('Titulo e imagen principal son obligatorios');
      return;
    }

    const ctaLabel = this.normalizeOptional(this.form.ctaLabel);
    const ctaUrl = this.normalizeOptional(this.form.ctaUrl);

    if ((ctaLabel === null) !== (ctaUrl === null)) {
      this.alert.error('CTA label y CTA URL deben completarse juntos');
      return;
    }

    const startAt = this.toInstant(this.form.startAt);
    const endAt = this.toInstant(this.form.endAt);

    if (startAt && endAt && new Date(endAt).getTime() <= new Date(startAt).getTime()) {
      this.alert.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    const payload: AdminBannerRequest = {
      title: this.form.title.trim(),
      subtitle: this.normalizeOptional(this.form.subtitle),
      imageUrl: this.form.imageUrl.trim(),
      imageUrlMobile: this.normalizeOptional(this.form.imageUrlMobile),
      ctaLabel,
      ctaUrl,
      displayOrder: Math.max(0, Number(this.form.displayOrder) || 0),
      isActive: this.form.isActive,
      startAt,
      endAt
    };

    const action$ = this.editingBanner
      ? this.adminBannerService.update(this.editingBanner.id, payload)
      : this.adminBannerService.create(payload);

    this.saving = true;

    action$.subscribe({
      next: () => {
        this.saving = false;
        this.alert.success(
          this.editingBanner
            ? 'Banner actualizado correctamente'
            : 'Banner creado correctamente'
        );
        this.resetForm();
        this.load();
      },
      error: error => {
        this.saving = false;

        if (error.status === 401) return;

        this.alert.error('No se pudo guardar el banner');
      }
    });
  }

  toggleStatus(banner: AdminBanner): void {
    const action$ = banner.isActive
      ? this.adminBannerService.deactivate(banner.id)
      : this.adminBannerService.activate(banner.id);

    const question = banner.isActive
      ? '¿Desactivar este banner?'
      : '¿Activar este banner?';

    this.alert.confirm(question).then(ok => {
      if (!ok) return;

      action$.subscribe({
        next: () => {
          this.alert.success(
            banner.isActive ? 'Banner desactivado' : 'Banner activado'
          );
          this.load();
        },
        error: error => {
          if (error.status === 401) return;
          this.alert.error('No se pudo cambiar el estado del banner');
        }
      });
    });
  }

  delete(banner: AdminBanner): void {
    this.alert.confirm(`¿Eliminar el banner "${banner.title}"?`).then(ok => {
      if (!ok) return;

      this.adminBannerService.delete(banner.id).subscribe({
        next: () => {
          this.alert.success('Banner eliminado');

          if (this.editingBanner?.id === banner.id) {
            this.resetForm();
          }

          this.load();
        },
        error: error => {
          if (error.status === 401) return;
          this.alert.error('No se pudo eliminar el banner');
        }
      });
    });
  }

  moveBanner(index: number, direction: -1 | 1): void {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= this.banners.length || this.reordering) {
      return;
    }

    const reordered = [...this.banners];
    const [movedBanner] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, movedBanner);

    this.reordering = true;

    this.adminBannerService.reorder({
      bannerIds: reordered.map(banner => banner.id)
    }).subscribe({
      next: () => {
        this.reordering = false;
        this.banners = reordered.map((banner, order) => ({
          ...banner,
          displayOrder: order
        }));
        this.alert.success('Orden actualizado');
        this.load();
      },
      error: error => {
        this.reordering = false;

        if (error.status === 401) return;

        this.alert.error('No se pudo reordenar los banners');
      }
    });
  }

  uploadImage(event: Event, target: UploadTarget): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.cloudinary.uploadPreset);

    if (target === 'desktop') {
      this.uploadingDesktop = true;
    } else {
      this.uploadingMobile = true;
    }

    this.http.post<{ secure_url: string }>(
      this.cloudinary.uploadUrl,
      formData
    ).subscribe({
      next: response => {
        if (target === 'desktop') {
          this.form.imageUrl = response.secure_url;
          this.uploadingDesktop = false;
        } else {
          this.form.imageUrlMobile = response.secure_url;
          this.uploadingMobile = false;
        }

        input.value = '';
      },
      error: () => {
        if (target === 'desktop') {
          this.uploadingDesktop = false;
        } else {
          this.uploadingMobile = false;
        }

        input.value = '';
        this.alert.error('No se pudo subir la imagen');
      }
    });
  }

  removeImage(target: UploadTarget): void {
    if (target === 'desktop') {
      this.form.imageUrl = '';
      return;
    }

    this.form.imageUrlMobile = '';
  }

  trackByBannerId(_: number, banner: AdminBanner): string {
    return banner.id;
  }

  formatSchedule(banner: AdminBanner): string {
    const start = banner.startAt ? this.formatDate(banner.startAt) : 'Siempre';
    const end = banner.endAt ? this.formatDate(banner.endAt) : 'Sin fin';
    return `${start} - ${end}`;
  }

  private createEmptyForm(): BannerFormValue {
    return {
      title: '',
      subtitle: '',
      imageUrl: '',
      imageUrlMobile: '',
      ctaLabel: '',
      ctaUrl: '',
      displayOrder: this.banners.length,
      isActive: true,
      startAt: '',
      endAt: ''
    };
  }

  private normalizeOptional(value: string): string | null {
    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private toInstant(value: string): string | null {
    if (!value) return null;
    return new Date(value).toISOString();
  }

  private toDateTimeLocalValue(value: string | null): string {
    if (!value) return '';

    const date = new Date(value);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

    return localDate.toISOString().slice(0, 16);
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  }
}
