export interface ProductImportBatch {

    id: string;

    fileName: string;

    totalProducts: number;

    importedProducts: number;

    failedProducts: number;

    createdAt: string;

}