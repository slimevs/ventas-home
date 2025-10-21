import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [NgFor],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent {
  readonly data = inject(DataService);
}

