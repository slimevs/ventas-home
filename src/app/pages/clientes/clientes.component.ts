import { Component, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
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

  nuevo: Cliente = { id: '', nombre: '', email: '', telefono: '', departamento: '' };
  editId: string | null = null;
  editModel: Cliente = { id: '', nombre: '', email: '', telefono: '', departamento: '' };

  get readOnly() { return this.data.mode() === 'csv'; }

  startEdit(c: Cliente) {
    this.editId = c.id;
    this.editModel = { ...c };
  }

  cancelEdit() {
    this.editId = null;
  }

  async add() {
    if (!this.nuevo.nombre?.trim()) return;
    await this.data.createCliente({ ...this.nuevo });
    this.nuevo = { id: '', nombre: '', email: '', telefono: '', departamento: '' };
  }

  async save() {
    if (!this.editModel.nombre?.trim()) return;
    await this.data.updateCliente({ ...this.editModel });
    this.editId = null;
  }

  async remove(id: string) {
    await this.data.deleteCliente(id);
  }
}
