import { Injectable, computed, effect, signal } from '@angular/core';
import { Venta } from '../models/venta.model';
import { Producto } from '../models/producto.model';
import { CsvService } from './csv.service';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export type DataMode = 'csv' | 'api' | 'mock';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _mode = signal<DataMode>(environment.mode);
  private readonly _ventas = signal<Venta[]>([]);
  private readonly _productos = signal<Producto[]>([]);
  private readonly _clientes = signal<string[]>([]);
  private readonly _filter = signal<{ from?: string; to?: string }>({});

  readonly mode = this._mode.asReadonly();
  readonly ventas = computed(() => this.filterVentas(this._ventas()));
  readonly productos = this._productos.asReadonly();
  readonly clientes = this._clientes.asReadonly();

  constructor(private csv: CsvService, private api: ApiService) {
    // configure sources
    this.csv.setUrl(environment.csvUrl);
    this.api.setBaseUrl(environment.apiBaseUrl);
    // initial load
    this.reload();
  }

  setFilter(filter: { from?: string; to?: string }) { this._filter.set(filter); }

  private filterVentas(list: Venta[]): Venta[] {
    const { from, to } = this._filter();
    return list.filter(v => {
      const d = v.fecha.getTime();
      const okFrom = from ? d >= new Date(from).getTime() : true;
      const okTo = to ? d <= new Date(to).getTime() : true;
      return okFrom && okTo;
    });
  }

  async reload() {
    switch (this._mode()) {
      case 'csv': {
        const list = await this.csv.list();
        this._ventas.set(list);
        break;
      }
      case 'api': {
        const list = await this.api.list();
        this._ventas.set(list);
        break;
      }
      default: {
        // mock data
        const now = new Date();
        const list: Venta[] = [
          { id: '1', fecha: now, cliente: 'Cliente A', producto: 'Producto 1', cantidad: 2, precio: 10, total: 20, costo: 12 },
          { id: '2', fecha: now, cliente: 'Cliente B', producto: 'Producto 2', cantidad: 1, precio: 15, total: 15, costo: 8 },
        ];
        this._ventas.set(list);
      }
    }
    // very basic mock for productos/clientes
    const productos: Producto[] = [
      { id: 'p1', nombre: 'Producto 1', precio: 10, costo: 6, stock: 12 },
      { id: 'p2', nombre: 'Producto 2', precio: 15, costo: 8, stock: 5 },
    ];
    this._productos.set(productos);
    this._clientes.set(['Cliente A', 'Cliente B', 'Cliente C']);
  }

  async createVenta(v: Venta): Promise<Venta> {
    if (this._mode() === 'csv') return v; // read-only
    if (this._mode() === 'api') {
      const saved = await this.api.create(v);
      this._ventas.set([saved, ...this._ventas()]);
      return saved;
    }
    // mock
    const saved = { ...v, id: crypto.randomUUID() };
    this._ventas.set([saved, ...this._ventas()]);
    return saved;
  }

  async updateVenta(v: Venta): Promise<Venta> {
    if (this._mode() === 'csv') return v; // read-only
    if (this._mode() === 'api') {
      const saved = await this.api.update(v);
      this._ventas.set(this._ventas().map(x => x.id === saved.id ? saved : x));
      return saved;
    }
    this._ventas.set(this._ventas().map(x => x.id === v.id ? v : x));
    return v;
  }

  async deleteVenta(id: string): Promise<void> {
    if (this._mode() === 'csv') return; // read-only
    if (this._mode() === 'api') {
      await this.api.remove(id);
    }
    this._ventas.set(this._ventas().filter(x => x.id !== id));
  }
}
