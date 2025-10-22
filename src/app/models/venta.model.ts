export interface Venta {
  id: string;
  fecha: Date;
  cliente: string;
  producto: string;
  productoId?: string;
  cantidad: number;
  precio: number;
  total: number;
  costo: number;
  medioPago?: string;
  estadoPago?: string;
}
