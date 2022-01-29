import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, LoadingController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import * as moment from 'moment';

import * as firebase from 'firebase/app';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user = {} as User;
  loading;
  profileData;

  constructor(public navCtrl: NavController, private afAuth: AngularFireAuth, public loadingCtrl: LoadingController, 
    public changeD : ChangeDetectorRef, public plt: Platform) {
    this.cekLogin();
     plt.registerBackButtonAction(() => {
       this.navCtrl.setRoot('TabsPage');
    });
  }

  async cekLogin() {
    try {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.navCtrl.setRoot("TabsPage",{ email: user.displayName });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  loadFB(){
    return new Promise((resolve) => {
    this.afAuth.auth.getRedirectResult().then((res)=>{
      if(res.user==null) {
        this.loading.dismiss();
        return;
      } else {
            //cek jika sudah terdaftar
            var userId = res.user.uid;
            this.profileData = firebase.database().ref('user/');
            this.profileData.child(userId).once('value').then(function(snapshot) {
              if (snapshot.val() == null) {
                  //jika belum terdaftar
                  firebase.database().ref('user/'+ userId).set({
                    nama : res.user.displayName,
                    email : res.user.email,
                    foto : res.user.photoURL,
                    cover : 'assets/imgs/background/cover-default.jpg',
                    joinDate: moment().format('DD-MM-YYYY')
                  })
                } 
              }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/network-request-failed') {
                  alert('Koneksi Internet Anda Bermasalah');
                } else {
                  alert(errorMessage);
                }

                this.loading.dismiss();
                return;
              })
          //})
        }
        resolve(true);
      })
  })
  }


 async login(user: User) {
   try {
     this.loading = this.loadingCtrl.create({
       content: 'Memproses Data'
     });
     this.loading.present();
     const result = await this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
     if (result) {
       this.loading.dismiss();
       this.navCtrl.setRoot("TabsPage", { email: user.email });
     } else {
       this.loading.dismiss();
       alert("Server Tidak Merespon, Coba Ulangi")
     }

   } catch (e) {
//     console.error(e);
 // Handle Errors here.
                var errorCode = e.code;
                var errorMessage = e.message;
                if (errorCode == 'auth/network-request-failed') {
                  alert('Koneksi Internet Anda Bermasalah');
                } else if(errorCode == 'auth/argument-error') {
                  alert('Harap Isi Email dan Password')
                }
                else if (errorCode == 'auth/invalid-email') {
                  alert('Penulisan Email Salah');
                } else if (errorCode == 'auth/user-not-found') {
                  alert('Anda Belum Terdaftar');
                } else {
                  alert(errorMessage);
                  console.log(errorCode);
                }

                this.loading.dismiss();
                return;
   }
 }

 masukDenganFacebook(user: User) {
   return new Promise((resolve) => {
   this.loading = this.loadingCtrl.create({
     content: 'Facebook Login'
   });
   this.loading.present();
   firebase.auth().signInWithRedirect(new firebase.auth.FacebookAuthProvider()).then(()=>{
     resolve(true);
   }).catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/network-request-failed') {
                  alert('Koneksi Internet Anda Bermasalah');
                } else {
                  alert(errorMessage);
                }
                return;
              }).then(()=>this.loading.dismiss());
 }).then((x) => {
        if (x) {
          this.loadFB().then(()=>{
             this.loading.dismiss();
          })
          
        }
    });
 }

 daftar() {
   this.navCtrl.push('DaftarPage');
 }

  reset() {
   this.navCtrl.push('LupaPage');
 }
}