import { Component, inject } from '@angular/core';
import { NgFor, CurrencyPipe, DatePipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { VentaFormComponent } from './venta-form.component';

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [NgFor, CurrencyPipe, DatePipe, VentaFormComponent],
  templateUrl: './ventas-list.component.html',
  styleUrls: ['./ventas-list.component.scss']
})
export class VentasListComponent {
  readonly data = inject(DataService);
  private expanded = new Set<string>();

  async remove(id: string) {
    await this.data.deleteVenta(id);
  }

  // Mobile expand/collapse
  isExpanded(id: string): boolean { return this.expanded.has(id); }
  toggleRow(id: string) {
    if (this.expanded.has(id)) this.expanded.delete(id); else this.expanded.add(id);
  }
}

