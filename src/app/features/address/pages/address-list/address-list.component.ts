import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AddressApiService } from '../../services/address-api.service';
import { Address } from '../../models/address.model';
import { AddressState } from '../../models/address.state';

import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [
    AddressAutocompleteComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './address-list.component.html',
})
export class AddressListComponent implements OnInit {

  addresses: Address[] = [];

  form: Partial<Address> = {};

  editingIndex: number | null = null;

  constructor(
    private addressApi: AddressApiService,
    private addressState: AddressState
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {

    this.addressApi.list().subscribe((res: any[]) => {

      console.log("ADDRESSES FROM API:", res);
      this.addresses = res.map(a => ({
        ...a,
        isDefault: a.isDefault ?? a.default
      }));

      this.addresses.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

      const def = this.addresses.find(a => a.isDefault);

      if (def) {
        this.addressState.setDefault(def);
      }

    });

  }

  save(): void {

    if (!this.form.addressLine) return;

    if (this.editingIndex !== null) {

      const address = this.addresses[this.editingIndex];

      if (!address?.id) return;

      this.addressApi.update(address.id, this.form as Address)
        .subscribe(() => {
          this.resetForm();
          this.load();
        });

    } else {

      this.addressApi.create(this.form as Address)
        .subscribe(() => {
          this.resetForm();
          this.load();
        });

    }

  }

  edit(index: number): void {

    const address = this.addresses[index];

    this.form = { ...address };

    this.editingIndex = index;

  }

  remove(index: number): void {

    const address = this.addresses[index];

    if (!address?.id) return;

    this.addressApi.delete(address.id)
      .subscribe(() => this.load());

  }

  setDefault(index: number): void {

    const address = this.addresses[index];

    if (!address?.id) return;

    this.addressApi.setDefault(address.id)
      .subscribe(() => {

        this.addressState.setDefault(address);

        this.load();

      });

  }

  onAutocomplete(address: Address): void {

    this.form = {
      ...this.form,
      ...address
    };

  }

  private resetForm(): void {

    this.form = {};

    this.editingIndex = null;

  }

}