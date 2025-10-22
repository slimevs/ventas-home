import { Injectable, computed, effect, signal } from '@angular/core';
import { Venta } from '../models/venta.model';
import { Producto } from '../models/producto.model';
import { Cliente } from '../models/cliente.model';
import { CsvService } from './csv.service';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

export type DataMode = 'csv' | 'api' | 'mock';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _mode = signal<DataMode>(environment.mode);
  private readonly _ventas = signal<Venta[]>([]);
  private readonly _productos = signal<Producto[]>([]);
  private readonly _clientes = signal<Cliente[]>([]);
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

  // Mostrar nombre de producto desde inventario si hay referencia por ID
  productNameFor(v: Venta): string {
    const byId = v.productoId ? this._productos().find(p => p && p.id === v.productoId) : undefined;
    return byId?.nombre || v.producto;
  }

  async reload() {
    switch (this._mode()) {
      case 'csv': {
        const list = await this.csv.list();
        this._ventas.set(list);
        // clientes quedan mock en csv
        break;
      }
      case 'api': {
        const [ventas, clientes, productos] = await Promise.all([
          this.api.list(),
          this.api.listClientes(),
          this.api.listProductos()
        ]);
        this._ventas.set(ventas);
        this._clientes.set(clientes);
        this._productos.set(productos);
        await this.reconcileVentaProductRefs();
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
    if (this._mode() !== 'api') {
      this._productos.set(productos);
    }
    if (this._mode() !== 'api') {
      this._clientes.set([
        { id: 'c1', nombre: 'Cliente A', email: 'a@mail.com', telefono: '111-111', departamento: 'Ventas' },
        { id: 'c2', nombre: 'Cliente B', email: 'b@mail.com', telefono: '222-222', departamento: 'Soporte' },
        { id: 'c3', nombre: 'Cliente C', departamento: 'Marketing' }
      ]);
    }
    await this.reconcileVentaProductRefs();
  }

  async createVenta(v: Venta): Promise<Venta> {
    if (this._mode() === 'csv') return v; // read-only
    if (this._mode() === 'api') {
      const saved = await this.api.create(v).catch(() => undefined as unknown as Venta);
      const sval = saved && saved.id !== undefined ? saved : v;
      this._ventas.set([sval, ...this._ventas()]);
      await this.applyStockDeltaRef(sval.productoId, sval.producto, -sval.cantidad);
      return sval;
    }
    // mock
    const saved = { ...v, id: crypto.randomUUID() };
    this._ventas.set([saved, ...this._ventas()]);
    await this.applyStockDeltaRef(saved.productoId, saved.producto, -saved.cantidad);
    return saved;
  }

  async updateVenta(v: Venta): Promise<Venta> {
    if (this._mode() === 'csv') return v; // read-only
    const prev = this._ventas().find(x => x.id === v.id);
    if (this._mode() === 'api') {
      const saved = await this.api.update(v).catch(() => undefined as unknown as Venta);
      const sid = saved && saved.id !== undefined ? saved.id : v.id;
      const sval = saved && saved.id !== undefined ? saved : v;
      this._ventas.set(this._ventas().map(x => x && x.id === sid ? sval : x));
      await this.adjustStockOnUpdate(prev, sval);
      return sval;
    }
    this._ventas.set(this._ventas().map(x => x.id === v.id ? v : x));
    await this.adjustStockOnUpdate(prev, v);
    return v;
  }

  async deleteVenta(id: string): Promise<void> {
    if (this._mode() === 'csv') return; // read-only
    const prev = this._ventas().find(x => x.id === id);
    if (this._mode() === 'api') {
      await this.api.remove(id);
    }
    this._ventas.set(this._ventas().filter(x => x.id !== id));
    if (prev) await this.applyStockDeltaRef(prev.productoId, prev.producto, prev.cantidad);
  }

  // Clientes CRUD (mock enabled, csv read-only, api TODO)
  async createCliente(c: Cliente): Promise<Cliente> {
    if (this._mode() === 'csv') return c; // read-only
    if (this._mode() === 'api') {
      const saved = await this.api.createCliente(c);
      this._clientes.set([saved, ...this._clientes()]);
      return saved;
    }
    const saved = { ...c, id: c.id || crypto.randomUUID() };
    this._clientes.set([saved, ...this._clientes()]);
    return saved;
  }

  async updateCliente(c: Cliente): Promise<Cliente> {
    if (this._mode() === 'csv') return c; // read-only
    if (this._mode() === 'api') {
      const saved = await this.api.updateCliente(c);
      this._clientes.set(this._clientes().map(x => x.id === saved.id ? saved : x));
      return saved;
    }
    this._clientes.set(this._clientes().map(x => x.id === c.id ? c : x));
    return c;
  }

  async deleteCliente(id: string): Promise<void> {
    if (this._mode() === 'csv') return; // read-only
    if (this._mode() === 'api') {
      await this.api.removeCliente(id);
    }
    this._clientes.set(this._clientes().filter(x => x.id !== id));
  }

  // --- Stock sync helpers ---
  private findProductByName(name: string): Producto | undefined {
    const n = String(name || '').toLowerCase();
    return this._productos().find(p => p.nombre.toLowerCase() === n);
  }

  private findProductByRef(id?: string, name?: string): Producto | undefined {
    if (id) {
      const byId = this._productos().find(p => p.id === id);
      if (byId) return byId;
    }
    if (name) return this.findProductByName(name);
    return undefined;
  }

  private async applyStockDeltaRef(productId: string | undefined, productName: string, delta: number): Promise<void> {
    if (!delta) return;
    const p = this.findProductByRef(productId, productName);
    if (!p) return;
    const newStock = Math.max(0, Number(p.stock || 0) + Number(delta));
    const updated: Producto = { ...p, stock: newStock };
    if (this._mode() === 'api') {
      try {
        const saved = await this.api.updateProducto(updated);
        const sid = saved && (saved as any).id ? (saved as any).id : updated.id;
        const sval = saved && (saved as any).id ? saved : updated;
        this._productos.set(this._productos().map(x => x && x.id === sid ? sval : x));
      } catch {
        this._productos.set(this._productos().map(x => x && x.id === updated.id ? updated : x));
      }
    } else {
      this._productos.set(this._productos().map(x => x && x.id === updated.id ? updated : x));
    }
  }

  private async adjustStockOnUpdate(prev: Venta | undefined, curr: Venta): Promise<void> {
    if (!prev) {
      await this.applyStockDeltaRef(curr.productoId, curr.producto, -curr.cantidad);
      return;
    }
    const changed = (prev.productoId && curr.productoId)
      ? prev.productoId !== curr.productoId
      : prev.producto.toLowerCase() !== curr.producto.toLowerCase();
    if (changed) {
      // return stock to previous product, reduce stock from new product
      await this.applyStockDeltaRef(prev.productoId, prev.producto, prev.cantidad);
      await this.applyStockDeltaRef(curr.productoId, curr.producto, -curr.cantidad);
    } else {
      const deltaCantidad = Number(curr.cantidad || 0) - Number(prev.cantidad || 0);
      // if increased quantity, reduce stock (negative delta); if decreased, restock (positive delta)
      await this.applyStockDeltaRef(curr.productoId, curr.producto, -deltaCantidad);
    }
  }

  // Productos CRUD (mock enabled, csv read-only, api supported)
  async createProducto(p: Producto): Promise<Producto> {
    if (this._mode() === 'csv') return p; // read-only
    if (this._mode() === 'api') {
      const saved = await this.api.createProducto(p);
      this._productos.set([saved, ...this._productos()]);
      return saved;
    }
    const saved = { ...p, id: p.id || crypto.randomUUID() } as Producto;
    this._productos.set([saved, ...this._productos()]);
    return saved;
  }

  async updateProducto(p: Producto): Promise<Producto> {
    if (this._mode() === 'csv') return p; // read-only
    if (this._mode() === 'api') {
      const saved = await this.api.updateProducto(p);
      this._productos.set(this._productos().map(x => x.id === saved.id ? saved : x));
      return saved;
    }
    this._productos.set(this._productos().map(x => x.id === p.id ? p : x));
    return p;
  }

  async deleteProducto(id: string): Promise<void> {
    if (this._mode() === 'csv') return; // read-only
    if (this._mode() === 'api') {
      await this.api.removeProducto(id);
    }
    this._productos.set(this._productos().filter(x => x.id !== id));
  }

  // --- Reconciliación ventas <-> productos ---
  private async reconcileVentaProductRefs(): Promise<void> {
    // Sanitize product list to avoid undefined/null entries coming from API
    const productos = (this._productos().filter((x): x is Producto => !!x));
    if (!productos.length) return;
    const byName = new Map<string, Producto>();
    const byId = new Map<string, Producto>();
    for (const p of productos) {
      if (!p) continue;
      const nameKey = String(p.nombre || '').toLowerCase();
      byName.set(nameKey, p);
      if (p.id) byId.set(p.id, p);
    }
    const ventas = this._ventas();
    const updated: Venta[] = [];
    let changed = false;
    for (const v of ventas) {
      let vChanged = false;
      let prod: Producto | undefined;
      if (v.productoId) {
        prod = byId.get(v.productoId);
        if (prod && v.producto !== prod.nombre) {
          v.producto = prod.nombre;
          vChanged = true;
        }
      } else {
        prod = byName.get(String(v.producto || '').toLowerCase());
        if (prod) {
          (v as any).productoId = prod.id;
          // opcionalmente actualizar el nombre exacto
          if (v.producto !== prod.nombre) {
            v.producto = prod.nombre;
          }
          vChanged = true;
        }
      }
      updated.push(v);
      changed = changed || vChanged;
    }
    if (changed) {
      this._ventas.set([...updated]);
      if (this._mode() === 'api') {
        // Persistir en background (sin bloquear)
        for (const v of updated) {
          // solo persistimos las que ahora tienen productoId asignado o nombre ajustado
          await this.api.update(v).catch(() => {});
        }
      }
    }
  }
}
