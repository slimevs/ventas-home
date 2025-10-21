import { Component, inject } from '@angular/core';
import { NgFor, CurrencyPipe } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [NgFor, CurrencyPipe],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent {
  readonly data = inject(DataService);
}

