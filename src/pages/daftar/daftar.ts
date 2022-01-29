import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';


import { User } from '../../models/user';
import * as moment from 'moment';

 @IonicPage()
 @Component({
   selector: 'page-daftar',
   templateUrl: 'daftar.html',
 })
 export class DaftarPage {

   user = {} as User;
   loading;

   constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, private afAuth: AngularFireAuth, private afDatabase : AngularFireDatabase) {
   }

   daftar(user : User) {
     return new Promise((resolve) => {
       this.loading = this.loadingCtrl.create({
         content: 'Daftar Akun'
       });
       this.loading.present();

       if(user.password.length<6) {
         alert("Password Minimal 6 Karakter");
         resolve(true);
         return;
       }

       this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password).then(()=>{this.createProfile()});
       resolve(true);

     })
     .catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                if (errorCode == 'auth/network-request-failed') {
                  alert('Koneksi Internet Anda Bermasalah');
                } else 
                if (errorCode == 'auth/weak-password') {
                  alert('Password Terlalu Lemah');
                } else if(errorCode == 'auth/argument-error') {
                  alert('Harap Isi Email dan Password')
                }
                else if (errorCode == 'auth/invalid-email') {
                  alert('Penulisan Email Salah');
                } else {
                  alert(errorMessage);
                }
              }).then(()=>{
                this.loading.dismiss();
                return;
              });

            } 


    createProfile() {
      this.afAuth.authState.take(1).subscribe(auth => {
      //akses ke database dengan primary uid
      this.user.joinDate = moment().format('DD-MM-YYYY');
      this.user.foto = 'assets/imgs/background/avatar-default.png';
      this.user.cover = 'assets/imgs/background/cover-default.jpg';
      this.afDatabase.object(`user/${auth.uid}`).set(this.user)
      .then(() => {
        this.loading.dismiss();
        this.navCtrl.setRoot('ProfilPage');
      }).catch (function(error){
          alert(error.message);
          this.loading.dismiss();
          return;
      })
    })
            }

          }
