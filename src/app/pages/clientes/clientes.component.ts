import { Component, inject, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DataService } from '../../services/data.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent {
  readonly data = inject(DataService);
  @ViewChild('clienteForm') clienteForm?: NgForm;

  nuevo: Cliente = { id: '', nombre: '', email: '', telefono: '', departamento: '' };
  editId: string | null = null;
  editModel: Cliente = { id: '', nombre: '', email: '', telefono: '', departamento: '' };
  private expanded = new Set<string>();
  toast: string | null = null;
  toastKind: 'success' | 'error' | 'info' = 'success';
  private toastTimer: any;
  toastLeaving = false;

  get readOnly() { return this.data.mode() === 'csv'; }

  startEdit(c: Cliente) {
    this.editId = c.id;
    this.editModel = { ...c };
    // ensure details row is visible while editing
    this.expanded.add(c.id);
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
    await this.data.createCliente({ ...this.nuevo });
    this.nuevo = { id: '', nombre: '', email: '', telefono: '', departamento: '' };
    this.clienteForm?.resetForm(this.nuevo);
    this.showToast('Cliente agregado', 'success');
  }

  async save() {
    if (!this.editModel.nombre?.trim()) return;
    const id = this.editModel.id;
    await this.data.updateCliente({ ...this.editModel });
    this.editId = null;
    if (id) this.expanded.delete(id);
    this.showToast('Cliente guardado', 'success');
  }

  async remove(id: string) {
    await this.data.deleteCliente(id);
    this.expanded.delete(id);
    this.showToast('Cliente eliminado', 'error');
  }

  // --- Mobile row expand/collapse ---
  isExpanded(id: string): boolean { return this.expanded.has(id); }
  toggleRow(id: string) {
    if (this.editId) return; // no toggle while editing
    if (this.expanded.has(id)) this.expanded.delete(id); else this.expanded.add(id);
  }

  private showToast(msg: string, kind: 'success' | 'error' | 'info' = 'success') {
    this.toast = msg;
    this.toastKind = kind;
    this.toastLeaving = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    const leaveAt = 1800; const removeAt = 2000;
    this.toastTimer = setTimeout(() => { this.toastLeaving = true; setTimeout(() => { this.toast = null; this.toastLeaving = false; }, removeAt - leaveAt); }, leaveAt);
  }
}
