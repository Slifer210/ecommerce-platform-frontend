import { Component, EventEmitter, Output } from '@angular/core';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { AddressSearchService } from '../../services/address-search.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-autocomplete.component.html',
  styleUrl: './address-autocomplete.component.css'
})
export class AddressAutocompleteComponent {

  @Output() addressSelected = new EventEmitter<any>();

  query = '';
  results: any[] = [];

  private search$ = new Subject<string>();

  constructor(private addressSearch: AddressSearchService) {
    this.search$
      .pipe(
        debounceTime(500),
        switchMap(q => this.addressSearch.search(q))
      )
      .subscribe(res => this.results = res);
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.query = input.value;

    if (this.query.length < 3) {
      this.results = [];
      return;
    }

    this.search$.next(this.query);
  }

  select(place: any) {
    this.query = place.display_name; 

    this.addressSelected.emit(this.map(place));
    this.results = [];
  }

  useManualAddress() {
    this.addressSelected.emit({
      addressLine: this.query,
      manualAddress: this.query,
      district: null,
      province: null,
      department: null,
      country: null,
      postalCode: null,
      lat: null,
      lon: null
    });

    this.results = [];
  }

  private map(place: any) {
    const a = place.address || {};

    return {
      addressLine: place.display_name,
      manualAddress: place.display_name,

      district:
        a.suburb ||
        a.city_district ||
        a.neighbourhood ||
        null,

      province:
        a.state_district ||
        a.county ||
        a.region ||
        null,

      department:
        a.state ||
        a.region ||
        null,

      country: a.country || null,
      postalCode: a.postcode || null,

      lat: place.lat ?? null,
      lon: place.lon ?? null
    };
  }
}
