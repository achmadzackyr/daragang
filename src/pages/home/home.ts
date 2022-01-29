import { Component, ViewChild } from '@angular/core';
import { NavController, Slides, LoadingController, NavParams, Refresher, ToastController } from 'ionic-angular';
import * as firebase from 'firebase/app';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('slider') slider: Slides;

  slides = [
    {
      title: 'Lapar tapi males keluar?',
      imageUrl: 'assets/imgs/slides/wishlist-1.jpg',
      songs: 1,
      private: false
    },
    {
      title: 'Pesan barang impianmu dengan bayar di tempat!',
      imageUrl: 'assets/imgs/slides/wishlist-2.jpg',
      songs: 2,
      private: false
    },
    {
      title: 'Gak mau antri di barbershop?',
      imageUrl: 'assets/imgs/slides/wishlist-3.jpg',
      songs: 3,
      private: true
    }
  ];

  loading;
  email;
  jumlah=Object();
  user;

  constructor(public navCtrl: NavController, public loadingCtrl:LoadingController, navParams: NavParams, public toastCtrl: ToastController) {
    this.email = navParams.get("email");
    if(this.email) {
      this.navCtrl.setRoot('TabsPage',{ email: this.email }).then(()=>{this.email=null});
    }
    this.user = firebase.auth().currentUser;
    this.jumlah.like=0;
    this.jumlah.komentar=0;
    this.jumlah.ulasan=0;
  }

  ionViewWillLoad() {
    if(this.user) {
      this.hitungNotif();
    }
  }

    doRefresh(refresher: Refresher) {
     
     this.navCtrl.setRoot('TabsPage');
     
     setTimeout(() => {
       refresher.complete();

       const toast = this.toastCtrl.create({
         message: 'Telah Dimuat Ulang',
         duration: 3000
       });
       toast.present();

     }, 1000);
   }

  makanan() {
    this.navCtrl.setRoot('MakananPage');
  }

  barang() {
    this.navCtrl.setRoot('BarangPage');
  }

  jasa() {
    this.navCtrl.setRoot('JasaPage');
  }

  pedagang() {
    this.navCtrl.setRoot('PedagangPage');
  }

  hitungNotif() {
    var jumlah=Object();
    jumlah.like=0;
    jumlah.komentar=0;
    jumlah.ulasan=0;

    firebase.database().ref("notifikasi").child(this.user.uid).once("value").then(function(snapshop){

      snapshop.forEach(function(childSnapshot){

        Object.keys(childSnapshot.val()).forEach(function(key) {

          firebase.database().ref("user").child(childSnapshot.val()[key].keyPelaku).once("value").then(function(snapshopUser){

            if(childSnapshot.key=="like") {

              if(childSnapshot.val()[key].aktif) {
                jumlah.like = jumlah.like+1;  
              }

            } else if (childSnapshot.key=="komentar") {

              if(childSnapshot.val()[key].aktif) {
                jumlah.komentar = jumlah.komentar+1;  
              }

            } else if (childSnapshot.key=="ulasan") {

              if(childSnapshot.val()[key].aktif) {
                jumlah.ulasan = jumlah.ulasan+1;  
              }
            }

          })
        })
      })
        return jumlah;
    })
    this.jumlah = jumlah; 
  }

}
