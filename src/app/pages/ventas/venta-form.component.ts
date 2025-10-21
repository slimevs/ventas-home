import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './venta-form.component.html',
  styleUrls: ['./venta-form.component.scss']
})
export class VentaFormComponent {
  readonly data = inject(DataService);
  open = signal(false);

  model = {
    fecha: new Date().toISOString().slice(0, 10),
    cliente: '',
    producto: '',
    cantidad: 1,
    precio: 0
  };

  async submit() {
    const { fecha, cliente, producto, cantidad, precio } = this.model;
    await this.data.createVenta({
      id: '',
      fecha: new Date(fecha),
      cliente,
      producto,
      cantidad: Number(cantidad),
      precio: Number(precio),
      total: Number(cantidad) * Number(precio),
      costo: 0
    });
    this.open.set(false);
  }
}

