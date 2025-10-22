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
  private expanded = new Set<string>();
  toast: string | null = null;
  private toastTimer: any;

  get readOnly() { return this.data.mode() === 'csv'; }

  startEdit(p: Producto) {
    this.editId = p.id;
    this.editModel = { ...p };
    this.expanded.add(p.id);
  }
  cancelEdit() {
    if (this.editId) {
      const id = this.editId;
      this.editId = null;
      this.expanded.delete(id);
    }
  }

  async add() {
    if (!this.nuevo.nombre?.trim()) return;
    await this.data.createProducto({ ...this.nuevo });
    this.nuevo = { id: '', nombre: '', precio: 0, costo: 0, stock: 0 };
  }
  async save() {
    if (!this.editModel.nombre?.trim()) return;
    const id = this.editModel.id;
    await this.data.updateProducto({ ...this.editModel });
    this.editId = null;
    if (id) this.expanded.delete(id);
    this.showToast('Producto guardado');
  }
  async remove(id: string) {
    await this.data.deleteProducto(id);
    this.expanded.delete(id);
    this.showToast('Producto eliminado');
  }

  // --- Mobile row expand/collapse ---
  isExpanded(id: string): boolean { return this.expanded.has(id); }
  toggleRow(id: string) {
    if (this.editId) return; // no toggle while editing
    if (this.expanded.has(id)) this.expanded.delete(id); else this.expanded.add(id);
  }

  private showToast(msg: string) {
    this.toast = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast = null; }, 2000);
  }
}
