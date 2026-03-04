import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProductImportService } from '../../services/admin-product-import.service';
import { ProductImportResult } from '../../models/product-import-result.model';
import { ProductImportBatch } from '../../models/product-import-batch.model';

@Component({
  selector: 'app-admin-product-import',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-product-import.component.html',
  styleUrls: ['./admin-product-import.component.css']
})
export class AdminProductImportComponent implements OnInit {

  selectedFile?: File;

  loading = false;

  result?: ProductImportResult;

  imports: ProductImportBatch[] = [];

  constructor(
    private importService: AdminProductImportService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {

    this.importService
      .getImportHistory()
      .subscribe({

        next: (res) => {
          this.imports = res;
        },

        error: () => {
          console.error('Error loading import history');
        }

      });

  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.selectedFile = input.files[0];

  }

  importProducts(): void {

    if (!this.selectedFile) return;

    this.loading = true;

    this.importService
      .importFile(this.selectedFile)
      .subscribe({

        next: (res) => {

          this.result = res;

          this.loading = false;

          this.loadHistory();

        },

        error: () => {

          alert('Error importing file');

          this.loading = false;

        }

      });

  }

  deleteBatch(batchId: string): void {

    if (!confirm('Delete this import batch?')) return;

    this.importService
      .deleteBatch(batchId)
      .subscribe({

        next: () => {

          alert('Batch deleted');

          this.loadHistory();

        },

        error: () => {

          alert('Error deleting batch');

        }

      });

  }

  rollbackImport(): void {

    if (!this.result?.batchId) return;

    if (!confirm('Delete this import batch?')) return;

    this.importService
      .deleteBatch(this.result.batchId)
      .subscribe({

        next: () => {

          alert('Import reverted');

          this.result = undefined;

          this.loadHistory();

        },

        error: () => {

          alert('Error deleting batch');

        }

      });

  }

}