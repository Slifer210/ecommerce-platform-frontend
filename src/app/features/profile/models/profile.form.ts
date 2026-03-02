import { FormControl } from "@angular/forms";

export interface ProfileForm {
    fullName: FormControl<string | null>;
    identityDocumentTypeId: FormControl<string | null>;
    identityDocumentNumber: FormControl<string | null>;
    phone: FormControl<string | null>;
}
