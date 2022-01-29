import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DisukaiPage } from './disukai';
import { Ionic2RatingModule } from "ionic2-rating";
import { SharedModule } from '../../app/shared.module';

@NgModule({
  declarations: [
    DisukaiPage
  ],
  imports: [
    IonicPageModule.forChild(DisukaiPage),
    Ionic2RatingModule,
    SharedModule
  ],
})
export class DisukaiPageModule {}
