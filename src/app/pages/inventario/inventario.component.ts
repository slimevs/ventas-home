import { Component, inject } from '@angular/core';
import { NgFor, CurrencyPipe, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [NgFor, CurrencyPipe, NgIf, NgClass, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {
  readonly data = inject(DataService);

  nuevo: Producto = { id: '', nombre: '', precio: 0, costo: 0, stock: 0 };
  editId: string | null = null;
  editModel: Producto = { id: '', nombre: '', precio: 0, costo: 0, stock: 0 };

  get readOnly() { return this.data.mode() === 'csv'; }

  startEdit(p: Producto) {
    this.editId = p.id;
    this.editModel = { ...p };
  }
  cancelEdit() { this.editId = null; }

  async add() {
    if (!this.nuevo.nombre?.trim()) return;
    await this.data.createProducto({ ...this.nuevo });
    this.nuevo = { id: '', nombre: '', precio: 0, costo: 0, stock: 0 };
  }
  async save() {
    if (!this.editModel.nombre?.trim()) return;
    await this.data.updateProducto({ ...this.editModel });
    this.editId = null;
  }
  async remove(id: string) {
    await this.data.deleteProducto(id);
  }
}
