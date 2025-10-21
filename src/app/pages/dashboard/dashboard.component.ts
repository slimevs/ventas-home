import { Component, computed, inject, signal } from '@angular/core';
import { NgFor, DatePipe, CurrencyPipe } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, DatePipe, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly data = inject(DataService);
  readonly range = signal<{ from?: string; to?: string }>({});

  readonly ventas = computed(() => this.data.ventas());

  readonly kpis = computed(() => {
    const ventas = this.ventas();
    const total = ventas.reduce((s, v) => s + v.total, 0);
    const count = ventas.length;
    const ticket = count ? total / count : 0;
    const ganancia = ventas.reduce((s, v) => s + (v.total - v.costo), 0);
    return [
      { label: 'Ventas (total)', value: total, type: 'currency' },
      { label: 'Operaciones', value: count, type: 'number' },
      { label: 'Ticket promedio', value: ticket, type: 'currency' },
      { label: 'Ganancia', value: ganancia, type: 'currency' }
    ];
  });

  setRange(from?: string, to?: string) {
    this.range.set({ from, to });
    this.data.setFilter({ from, to });
  }
}

