import { Component, inject, signal } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, CurrencyPipe],
  templateUrl: './venta-form.component.html',
  styleUrls: ['./venta-form.component.scss']
})
export class VentaFormComponent {
  readonly data = inject(DataService);
  open = signal(false);
  toast: string | null = null;
  toastKind: 'success' | 'error' | 'info' = 'success';
  private toastTimer: any;
  toastLeaving = false;

  model = {
    fecha: new Date().toISOString().slice(0, 10),
    cliente: '',
    producto: '',
    productoId: '' as string | undefined,
    cantidad: 1,
    precio: 0
  };

  onProductoChange(name: string) {
    const p = this.data.productos().find(x => x.nombre.toLowerCase() === String(name).toLowerCase());
    if (p) {
      this.model.producto = p.nombre;
      this.model.productoId = p.id;
      this.model.precio = p.precio;
    }
  }

  onClienteChange(name: string) {
    const c = this.data.clientes().find(x => x.nombre.toLowerCase() === String(name).toLowerCase());
    if (c) {
      this.model.cliente = c.nombre;
    }
  }

  total() {
    const cantidad = Number(this.model.cantidad || 0);
    const precio = Number(this.model.precio || 0);
    return cantidad * precio;
  }

  async submit() {
    const { fecha, cliente, producto, cantidad, precio } = this.model;
    await this.data.createVenta({
      id: '',
      fecha: new Date(fecha),
      cliente,
      producto,
      productoId: this.model.productoId,
      cantidad: Number(cantidad),
      precio: Number(precio),
      total: Number(cantidad) * Number(precio),
      costo: 0
    });
    this.showToast('Venta guardada', 'success');
    this.open.set(false);
  }

  private showToast(msg: string, kind: 'success' | 'error' | 'info' = 'success') {
    this.toast = msg;
    this.toastKind = kind;
    this.toastLeaving = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    // start leave animation shortly before removing
    const leaveAt = 1800;
    const removeAt = 2000;
    this.toastTimer = setTimeout(() => { this.toastLeaving = true; setTimeout(() => { this.toast = null; this.toastLeaving = false; }, removeAt - leaveAt); }, leaveAt);
  }
}
