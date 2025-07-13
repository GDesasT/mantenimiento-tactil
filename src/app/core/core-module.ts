import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatabaseService } from './services/database';
import { MachineService } from './services/machine';
import { PartService } from './services/part';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [DatabaseService, MachineService, PartService],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
