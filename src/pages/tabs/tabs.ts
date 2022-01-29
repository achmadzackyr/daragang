import { Component } from '@angular/core';
import { IonicPage, NavParams,ToastController } from 'ionic-angular';
import { HomePage } from '../home/home';

/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = "DisukaiPage";
  tab3Root = "ProfilPage";

  email;
  keluar;

  constructor(navParams: NavParams,private toast: ToastController) {
  	    this.email = navParams.get("email");
    	this.keluar = navParams.get("keluar");
  }


  ionViewWillLoad() {
      if (this.email != null) {
        this.toast.create({
          message: `Selamat datang, ${this.email}`,
          duration: 3000,position: 'top'
        }).present();
      } else if (this.keluar) {
          this.toast.create({
          message: `Anda telah keluar`,
          duration: 3000,position: 'top'
        }).present();
      }
  }

}
