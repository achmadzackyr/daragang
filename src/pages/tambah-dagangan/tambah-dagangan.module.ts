import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TambahDaganganPage } from './tambah-dagangan';

@NgModule({
  declarations: [
    TambahDaganganPage,
  ],
  imports: [
    IonicPageModule.forChild(TambahDaganganPage),
  ],
})
export class TambahDaganganPageModule {}
