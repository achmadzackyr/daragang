import { ComponentsModule } from '../components/components.module';

import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';

@NgModule({
  imports: [
    IonicModule,
    ComponentsModule,
  ],
  exports: [
    ComponentsModule,
  ]
})

export class SharedModule { }
