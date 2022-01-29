import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BarangPage } from './barang';
import { Ionic2RatingModule } from "ionic2-rating";

@NgModule({
  declarations: [
    BarangPage,
  ],
  imports: [
    IonicPageModule.forChild(BarangPage),
    Ionic2RatingModule,
  ],
})
export class BarangPageModule {}
