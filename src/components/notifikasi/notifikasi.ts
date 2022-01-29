import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

@Component({
  selector: 'notifikasi',
  templateUrl: 'notifikasi.html'
})
export class NotifikasiComponent {

  constructor(public viewCtrl: ViewController) {
  }

  telahDibaca() {
  	this.viewCtrl.dismiss("baca");
  }

  hapusNotif() {
  	this.viewCtrl.dismiss("hapus");	
  }

}
