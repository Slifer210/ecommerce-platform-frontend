export interface ProductImportResult {
    batchId: string;
    imported: number;
    failed: number;
    errors: string[];
}
