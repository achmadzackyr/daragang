import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JasaPage } from './jasa';
import { Ionic2RatingModule } from "ionic2-rating";

@NgModule({
  declarations: [
    JasaPage,
  ],
  imports: [
    IonicPageModule.forChild(JasaPage),
    Ionic2RatingModule,
  ],
})
export class JasaPageModule {}
