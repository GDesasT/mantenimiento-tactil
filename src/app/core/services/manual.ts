import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatabaseService } from './database';
import { Manual, CreateManualDto } from '../models';

/** Devuelve true si estamos dentro de Electron */
function isElectron(): boolean {
  return !!(window as any).electron?.ipcRenderer;
}

/** Llama a un canal IPC de Electron */
function ipc(channel: string, args: object): Promise<any> {
  return (window as any).electron.ipcRenderer.invoke(channel, args);
}

@Injectable({
  providedIn: 'root',
})
export class ManualService {
  private manualsSubject = new BehaviorSubject<Manual[]>([]);
  public manuals$ = this.manualsSubject.asObservable();

  constructor(private db: DatabaseService) {}

  // Cargar todos los manuales (migra base64 legacy → disco si es necesario)
  loadManuals(): Observable<Manual[]> {
    return from(
      this.db.manuals.toArray().then(async (manuals) => {
        if (!isElectron()) return manuals;

        // Migrar cualquier manual que todavía tenga base64 en pdfData
        const toMigrate = manuals.filter((m) => m.pdfData?.startsWith('data:'));
        for (const m of toMigrate) {
          const res = await ipc('pdf-migrate', { fileName: m.fileName, base64Data: m.pdfData });
          if (res.success) {
            await this.db.manuals.update(m.id, { pdfData: res.filePath });
            m.pdfData = res.filePath;
            console.log('🔄 Migrado a disco:', m.name);
          }
        }
        return manuals;
      })
    ).pipe(
      tap((manuals) => {
        console.log('📚 Loaded manuals:', manuals.length);
        this.manualsSubject.next(manuals);
      })
    );
  }

  // Obtener manual por ID
  getManualById(id: number): Observable<Manual | undefined> {
    return from(this.db.manuals.get(id));
  }

  // Crear nuevo manual — guarda PDF en disco si estamos en Electron
  createManual(data: CreateManualDto): Observable<Manual> {
    return from(
      (async () => {
        let pdfData = data.pdfData;

        if (isElectron() && pdfData.startsWith('data:')) {
          const res = await ipc('pdf-save', { fileName: data.fileName, base64Data: pdfData });
          if (res.success) {
            pdfData = res.filePath;
            console.log('💾 PDF guardado en disco:', res.filePath);
          }
        }

        const id = await this.db.manuals.add({ ...data, pdfData } as Manual);
        return {
          ...data,
          pdfData,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Manual;
      })()
    ).pipe(
      tap((manual) => {
        console.log('✅ Created manual:', manual.name);
        this.loadManuals().subscribe();
      })
    );
  }

  // Actualizar manual
  updateManual(id: number, updates: Partial<Manual>): Observable<void> {
    return from(this.db.manuals.update(id, updates)).pipe(
      map(() => void 0),
      tap(() => {
        console.log('📝 Updated manual:', id);
        this.loadManuals().subscribe();
      })
    );
  }

  // Eliminar manual — también borra el archivo en disco
  deleteManual(id: number): Observable<void> {
    return from(
      (async () => {
        if (isElectron()) {
          const manual = await this.db.manuals.get(id);
          if (manual?.pdfData && !manual.pdfData.startsWith('data:')) {
            await ipc('pdf-delete', { filePath: manual.pdfData });
          }
        }
        await this.db.manuals.delete(id);
      })()
    ).pipe(
      tap(() => {
        console.log('🗑️ Deleted manual:', id);
        this.loadManuals().subscribe();
      })
    );
  }

  // Convertir File a base64 (se usa al subir, antes de guardar en disco)
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

