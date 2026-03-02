import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class CheckoutService {

    private readonly API_URL = '/api/checkout';

    constructor(private http: HttpClient) {}

    startCheckout() {
        return this.http.post<{ initPoint: string }>(
        this.API_URL,
        {}
        );
    }


    getActiveCheckout(): Observable<{ preferenceId: string; initPoint: string }> {
            return this.http.get<{ preferenceId: string; initPoint: string }>(
            `${this.API_URL}/active`
            );
        }

    getCheckoutByOrder(orderId: string) {
        return this.http.get<{ preferenceId: string; initPoint: string }>(
            `/api/checkout/order/${orderId}`
        );
    }

}
