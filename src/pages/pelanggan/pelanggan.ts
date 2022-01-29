import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the PelangganPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pelanggan',
  templateUrl: 'pelanggan.html',
})
export class PelangganPage {

	item;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  	this.item = navParams.get('pelanggan');

  	console.log(this.item);
  }

  lihatDetail(keyUser) {
  	// console.log(keyUser);
  	this.navCtrl.push("ProfilPage",{keyUser : keyUser});
  }

}
