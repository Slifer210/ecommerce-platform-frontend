import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    success(message: string, title: string = 'Éxito') {
        Swal.fire({
        icon: 'success',
        title,
        text: message,
        timer: 2000,
        showConfirmButton: false
        });
    }

    error(message: string, title: string = 'Error') {
        Swal.fire({
        icon: 'error',
        title,
        text: message
        });
    }

    info(message: string, title: string = 'Información') {
        Swal.fire({
        icon: 'info',
        title,
        text: message
        });
    }

    confirm(
        message: string,
        title: string = 'Confirmación'
    ): Promise<boolean> {
        return Swal.fire({
        title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar'
        }).then(result => result.isConfirmed);
    }
}
