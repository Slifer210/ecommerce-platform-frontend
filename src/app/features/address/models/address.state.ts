import { Injectable, signal } from '@angular/core';
import { Address } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressState {

    private _default = signal<Address | null>(null);

    setDefault(address: Address) {
        this._default.set(address);
    }

    clear() {
        this._default.set(null);
    }

    default() {
        return this._default();
    }

    summary(): string {

        const a = this._default();

        if (!a) return 'Sin dirección';

        if (a.district && a.province) {
            return `${a.district}, ${a.province}`;
        }

        return a.addressLine;
    }
}
