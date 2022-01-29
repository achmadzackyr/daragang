import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilPage } from './profil';
import { Ionic2RatingModule } from "ionic2-rating";
import { SharedModule } from '../../app/shared.module';



@NgModule({
  declarations: [
    ProfilPage
  ],
  imports: [
    IonicPageModule.forChild(ProfilPage),
     Ionic2RatingModule,
     SharedModule
  ],
})
export class ProfilPageModule {}
