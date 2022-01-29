import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailPage } from './detail';
import { Ionic2RatingModule } from "ionic2-rating";

@NgModule({
  declarations: [
    DetailPage,
  ],
  imports: [
    IonicPageModule.forChild(DetailPage),
    Ionic2RatingModule,
  ],
})
export class DetailPageModule {}
