import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { parseCsv } from '../utils/csv';
import { Venta } from '../models/venta.model';

@Injectable({ providedIn: 'root' })
export class CsvService {
  private http = inject(HttpClient);
  url = '';

  setUrl(url: string) { this.url = url; }

  async list(): Promise<Venta[]> {
    if (!this.url) return [];
    const text = await firstValueFrom(this.http.get(this.url, { responseType: 'text' }));
    const rows = parseCsv(text);
    const [header, ...data] = rows;
    const idx = (name: string) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());
    const idI = idx('id');
    const fechaI = idx('fecha');
    const clienteI = idx('cliente');
    const productoI = idx('producto');
    const cantidadI = idx('cantidad');
    const precioI = idx('precio');
    const totalI = idx('total');
    const costoI = idx('costo');
    return data.map((r) => ({
      id: r[idI] || crypto.randomUUID(),
      fecha: new Date(r[fechaI] || Date.now()),
      cliente: r[clienteI] || '',
      producto: r[productoI] || '',
      cantidad: Number(r[cantidadI] || 0),
      precio: Number(r[precioI] || 0),
      total: Number(r[totalI] || 0),
      costo: Number(r[costoI] || 0),
    }));
  }
}

