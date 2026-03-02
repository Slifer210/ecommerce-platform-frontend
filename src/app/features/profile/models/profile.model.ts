export interface Profile {
    email: string;
    fullName: string;
    identityDocumentType: string | null;
    identityDocumentNumber: string | null;
    identityDocumentVerified: boolean;
    phone: string | null;
    profileImageUrl: string | null;
    profileCompleted: boolean;
}

export interface IdentityDocumentType {
    id: string;
    code: string;
    name: string;
    requiresVerification: boolean;
    countryCode: string | null;
}
