import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MakananPage } from './makanan';
import { Ionic2RatingModule } from "ionic2-rating";

@NgModule({
  declarations: [
    MakananPage,
  ],
  imports: [
    IonicPageModule.forChild(MakananPage),
    Ionic2RatingModule,
  ],
})
export class MakananPageModule {}
