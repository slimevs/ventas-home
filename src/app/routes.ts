import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VentasListComponent } from './pages/ventas/ventas-list.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ClientesComponent } from './pages/clientes/clientes.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'Dashboard' },
  { path: 'ventas', component: VentasListComponent, title: 'Ventas' },
  { path: 'inventario', component: InventarioComponent, title: 'Inventario' },
  { path: 'clientes', component: ClientesComponent, title: 'Clientes' },
  { path: '**', redirectTo: '' }
];

