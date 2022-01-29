import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProfilPage } from './edit-profil';

@NgModule({
  declarations: [
    EditProfilPage,
  ],
  imports: [
    IonicPageModule.forChild(EditProfilPage),
  ],
})
export class EditProfilPageModule {}
