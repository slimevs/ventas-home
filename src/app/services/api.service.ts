import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Venta } from '../models/venta.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  baseUrl = '';

  setBaseUrl(url: string) { this.baseUrl = url?.replace(/\/$/, '') ?? ''; }

  async list(): Promise<Venta[]> {
    const url = `${this.baseUrl}?action=list`;
    const res = await firstValueFrom(this.http.get<any>(url));
    return (res?.data || []).map(this.deserializeVenta);
  }

  async create(v: Venta): Promise<Venta> {
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, { action: 'create', data: this.serializeVenta(v) })
    );
    return this.deserializeVenta(res?.data);
  }

  async update(v: Venta): Promise<Venta> {
    const res = await firstValueFrom(
      this.http.post<any>(this.baseUrl, { action: 'update', data: this.serializeVenta(v) })
    );
    return this.deserializeVenta(res?.data);
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.post<any>(this.baseUrl, { action: 'delete', id }));
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
}

