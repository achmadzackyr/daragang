import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PedagangPage } from './pedagang';
import { Ionic2RatingModule } from "ionic2-rating";

@NgModule({
  declarations: [
    PedagangPage,
  ],
  imports: [
    IonicPageModule.forChild(PedagangPage),
    Ionic2RatingModule
  ],
})
export class PedagangPageModule {}
