import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import * as firebase from 'firebase/app';

/**
 * Generated class for the LupaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-lupa',
  templateUrl: 'lupa.html',
})
export class LupaPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  reset(email) {
  	var auth = firebase.auth();
	var emailAddress = email;

	auth.sendPasswordResetEmail(emailAddress).then(()=>{
	  // Email sent.
	  alert('Selesai, Mohon Periksa Email Anda');
	  this.navCtrl.setRoot("TabsPage");
	}).catch(function(error) {
	  // An error happened.
	  // console.log(error.code);
	  // alert(error.message);

	    var errorCode = error.code;
	    var errorMessage = error.message;
	    if (errorCode == 'auth/network-request-failed') {
	      alert('Koneksi Internet Anda Bermasalah');
	    } else if(errorCode == 'auth/argument-error') {
	      alert('Harap Isi Email');
	    }
	    else if (errorCode == 'auth/invalid-email') {
	      alert('Penulisan Email Salah');
	    } else if(errorCode=='auth/user-not-found'){
	    	alert('Alamat Email Belum Terdaftar');
	    } else {
	      alert(errorMessage);
	      console.log(errorCode);
	    }
	});
  }

}
