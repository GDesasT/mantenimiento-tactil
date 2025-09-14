import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetitionService } from '../../core/services/petition';
import { PartService } from '../../core/services/part';
import { TouchButtonComponent } from '../../shared/components/touch-button/touch-button';
import { Petition, Part } from '../../core/models';

@Component({
  selector: 'app-peticiones-admin',
  standalone: true,
  imports: [CommonModule, TouchButtonComponent],
  templateUrl: './peticiones-admin.html',
  styleUrl: './peticiones-admin.scss'
})
export class PeticionesAdmin implements OnInit {
  petitions: Petition[] = [];
  partsMap = new Map<number, Part>();
  loading = true;

  constructor(
    private petitionService: PetitionService,
    private partService: PartService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.petitionService.loadAll().subscribe((rows) => {
      this.petitions = rows;
      // Precargar partes referenciadas
      const partIds = Array.from(new Set(rows.map((r) => r.partId)));
      // Cargar todas las partes y mapear (simple)
      this.partService.loadParts().subscribe((parts) => {
        this.partsMap.clear();
        parts.forEach((p) => this.partsMap.set(p.id!, p));
        this.loading = false;
      });
    });
  }

  approve(p: Petition) {
    if (!p.id) return;
    // Optimista: actualizar UI al instante
    p.status = 'approved';
    this.petitionService.updateStatus(p.id, 'approved').subscribe({
      error: () => {
        // Si falla, revertir (opcional)
        p.status = 'pending';
      },
    });
  }

  reject(p: Petition) {
    if (!p.id) return;
    // Optimista: actualizar UI al instante
    p.status = 'rejected';
    this.petitionService.updateStatus(p.id, 'rejected').subscribe({
      error: () => {
        // Si falla, revertir (opcional)
        p.status = 'pending';
      },
    });
  }
}
