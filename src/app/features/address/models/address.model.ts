
export interface Address {
    id?: string;
    addressLine: string;
    district?: string;
    province?: string;
    department?: string;
    country?: string;
    postalCode?: string;
    reference?: string;
    isDefault?: boolean;
}