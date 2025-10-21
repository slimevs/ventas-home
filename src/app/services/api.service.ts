import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Venta } from '../models/venta.model';
import { Cliente } from '../models/cliente.model';
import { Producto } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  baseUrl = '';

  setBaseUrl(url: string) { this.baseUrl = url?.replace(/\/$/, '') ?? ''; }

  private isRelativeBase() { return this.baseUrl.startsWith('/'); }
  private async getJson<T>(url: string): Promise<T> {
    if (this.isRelativeBase()) {
      return await firstValueFrom(this.http.get<T>(url));
    }
    return await firstValueFrom(this.http.jsonp<T>(url, 'callback'));
  }

  async list(): Promise<Venta[]> {
    const url = `${this.baseUrl}?action=list&entity=ventas`;
    const res = await this.getJson<any>(url);
    return (res?.data || []).map(this.deserializeVenta);
  }

  async create(v: Venta): Promise<Venta> {
    const body = new URLSearchParams();
    body.set('action', 'create');
    body.set('entity', 'ventas');
    body.set('data', JSON.stringify(this.serializeVenta(v)));
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
    );
    return this.deserializeVenta(res?.data);
  }

  async update(v: Venta): Promise<Venta> {
    const body = new URLSearchParams();
    body.set('action', 'update');
    body.set('entity', 'ventas');
    body.set('data', JSON.stringify(this.serializeVenta(v)));
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
    );
    return this.deserializeVenta(res?.data);
  }

  async remove(id: string): Promise<void> {
    const body = new URLSearchParams();
    body.set('action', 'delete');
    body.set('entity', 'ventas');
    body.set('id', id);
    await firstValueFrom(this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }));
  }

  private serializeVenta(v: Venta) {
    return {
      ...v,
      fecha: v.fecha instanceof Date ? v.fecha.toISOString() : v.fecha
    };
  }
  private deserializeVenta = (r: any): Venta => ({
    id: String(r.id ?? ''),
    fecha: new Date(r.fecha),
    cliente: String(r.cliente ?? ''),
    producto: String(r.producto ?? ''),
    cantidad: Number(r.cantidad ?? 0),
    precio: Number(r.precio ?? 0),
    total: Number(r.total ?? 0),
    costo: Number(r.costo ?? 0)
  });

  // ---- Clientes ----
  async listClientes(): Promise<Cliente[]> {
    const url = `${this.baseUrl}?action=list&entity=clientes`;
    const res = await this.getJson<any>(url);
    return (res?.data || []) as Cliente[];
  }

  async createCliente(c: Cliente): Promise<Cliente> {
    const body = new URLSearchParams();
    body.set('action', 'create');
    body.set('entity', 'clientes');
    body.set('data', JSON.stringify(c));
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
    );
    return res?.data as Cliente;
  }

  async updateCliente(c: Cliente): Promise<Cliente> {
    const body = new URLSearchParams();
    body.set('action', 'update');
    body.set('entity', 'clientes');
    body.set('data', JSON.stringify(c));
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
    );
    return res?.data as Cliente;
  }

  async removeCliente(id: string): Promise<void> {
    const body = new URLSearchParams();
    body.set('action', 'delete');
    body.set('entity', 'clientes');
    body.set('id', id);
    await firstValueFrom(this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }));
  }

  // ---- Productos ----
  async listProductos(): Promise<Producto[]> {
    const url = `${this.baseUrl}?action=list&entity=productos`;
    const res = await this.getJson<any>(url);
    return (res?.data || []) as Producto[];
  }

  async createProducto(p: Producto): Promise<Producto> {
    const body = new URLSearchParams();
    body.set('action', 'create');
    body.set('entity', 'productos');
    body.set('data', JSON.stringify(p));
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
    );
    return res?.data as Producto;
  }

  async updateProducto(p: Producto): Promise<Producto> {
    const body = new URLSearchParams();
    body.set('action', 'update');
    body.set('entity', 'productos');
    body.set('data', JSON.stringify(p));
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } })
    );
    return res?.data as Producto;
  }

  async removeProducto(id: string): Promise<void> {
    const body = new URLSearchParams();
    body.set('action', 'delete');
    body.set('entity', 'productos');
    body.set('id', id);
    await firstValueFrom(this.http.post<any>(this.baseUrl, body.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }));
  }
}
