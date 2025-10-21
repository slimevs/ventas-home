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

  async remove(id: string) {
    await this.data.deleteVenta(id);
  }
}

