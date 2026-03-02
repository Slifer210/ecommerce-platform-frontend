import { Component, OnInit } from '@angular/core';
import { AddressAutocompleteComponent } from "../../components/address-autocomplete/address-autocomplete.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddressApiService } from '../../services/address-api.service';
import { Address } from '../../models/address.model';
import { AddressState } from '../../models/address.state';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [AddressAutocompleteComponent, FormsModule, CommonModule],
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

  ngOnInit() {
    this.load();
  }

  load() {
    this.addressApi.list().subscribe(res => {
      this.addresses = res;

      const def = res.find(a => a.isDefault);
      if (def) {
        this.addressState.setDefault(def);
      }
    });
  }

  save() {
    if (!this.form.addressLine) {
      return; // o muestra error visual
    }

    if (this.editingIndex !== null) {
      const address = this.addresses[this.editingIndex];

      this.addressApi.update(address.id!, this.form as Address)
        .subscribe(() => {
          this.editingIndex = null;
          this.form = {};
          this.load();
        });

    } else {
      this.addressApi.create(this.form as Address)
        .subscribe(() => {
          this.form = {};
          this.load();
        });
    }
  }

  edit(index: number) {
    this.form = { ...this.addresses[index] };
    this.editingIndex = index;
  }

  remove(index: number) {
    const id = this.addresses[index].id!;
    this.addressApi.delete(id).subscribe(() => this.load());
  }

  setDefault(index: number) {
    const address = this.addresses[index];

    this.addressApi.setDefault(address.id!).subscribe(() => {
      this.addressState.setDefault(address);
      this.load();
    });
  }

  onAutocomplete(address: Address) {
    this.form = { ...this.form, ...address };
  }
}
