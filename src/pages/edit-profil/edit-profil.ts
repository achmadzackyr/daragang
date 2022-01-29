import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams,ActionSheetController, LoadingController, IonicPage, 
  Platform, AlertController, Navbar } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { User } from '../../models/user';
import { Dagangan } from '../../models/dagangan';

import { storage } from 'firebase';
import { Camera, CameraOptions } from '@ionic-native/camera';

import 'rxjs/add/operator/map';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import leaflet from 'leaflet';

declare var window : any;

@IonicPage()
@Component({
  selector: 'page-edit-profil',
  templateUrl: 'edit-profil.html',
})

export class EditProfilPage {
  @ViewChild('navbar') navBar: Navbar;
  @ViewChild('myInput') myInput: ElementRef;
  @ViewChild('myInputD') myInputD: ElementRef;

  @ViewChild('map') mapContainer: ElementRef;
  map: any;
  lat;
  long;

  items: any;
  user = {} as User;
  dagangan = {} as Dagangan;
  uid : any;
  profilRef$ : Observable<any>;
  loading;
  itemRef: AngularFireObject<any>;
  basePath: string;
  kabupaten;
  ciamis=false;
  banjar=false;
  pangandaran=false;
  kotatasikmalaya=false;
  kabtasikmalaya=false;
  garut=false;
  sumedang=false;
  customTrackBy(index: number, obj: any): any {
    return  index;
  }
  cod;
  dismissing;
  lastBack;
  spamming;

  constructor(public navCtrl: NavController, public navParams: NavParams, private afDatabase: AngularFireDatabase, 
    public afAuth: AngularFireAuth, private camera: Camera, private actionSheetCtrl: ActionSheetController,  
    public loadingCtrl: LoadingController, private alrtCtrl : AlertController,
    public plt: Platform) {
    // let elements = document.querySelectorAll(".tabbar");

    // if (elements != null) {
    //     Object.keys(elements).map((key) => {
    //         elements[key].style.display = 'none';
    //     });
    // }

     plt.registerBackButtonAction(() => {
       this.showPromptBack();
    });

    afAuth.authState.subscribe(user => {
      if (!user) {
        this.uid = null;        
        return;
      }
      this.uid = user.uid;
      this.load(this.uid);
    });

    this.cod = navParams.get("cod");
    if(this.cod) {
          //code untuk inisialisasi input wilayah pegiriman ongkir
          var i;
          var jar=0;
          var mis=0;
          var ran=0;
          var kabaya=0;
          var kotaya=0;
          var rut=0;
          var dang=0;
          for (i = 0; i < this.cod.length; i++) {
            if(this.cod[i].kabupaten=="Kota banjar") {
              this.kecBanjar[jar] = this.cod[i].ongkir;
              jar=jar+1;
            }
            if(this.cod[i].kabupaten=="Kab. ciamis") {
              this.kecCiamis[mis] = this.cod[i].ongkir;
              mis=mis+1;
            }
            if(this.cod[i].kabupaten=="Kab. pangandaran") {
              this.kecPangandaran[ran] = this.cod[i].ongkir;
              ran=ran+1;
            }
            if(this.cod[i].kabupaten=="Kota Tasikmalaya") {
              this.kecKotaTasikmalaya[kotaya] = this.cod[i].ongkir;
              kotaya=kotaya+1;
            }
            if(this.cod[i].kabupaten=="Kab. tasikmalaya") {
              this.kecKabTasikmalaya[kabaya] = this.cod[i].ongkir;
              kabaya=kabaya+1;
            }
            if(this.cod[i].kabupaten=="Kab. garut") {
              this.kecGarut[rut] = this.cod[i].ongkir;
              rut=rut+1;
            }
            if(this.cod[i].kabupaten=="Kab. sumedang") {
              this.kecSumedang[dang] = this.cod[i].ongkir;
              dang=dang+1;
            }
          }
        }
      }

  loadMap(uid) {
    firebase.database().ref("user").child(uid).once("value")
      .then(function(snapshot) {
        if(snapshot.val().lat && snapshot.val().long) {
          return [snapshot.val().lat, snapshot.val().long];  
        } else {
          return [0,0];
        }
      }).then(([lat,long])=>{
        if(lat==0 && long==0) {
          this.initMapNull();
        } else {
          this.initMap(lat,long);  
        }
      })
  }

  initMap(lat,long){
    if(this.map) {
      this.map.off();
      this.map.remove();
    }
    this.map = leaflet.map("map").setView([lat,long], 14);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18
     }).addTo(this.map);

      let markerOptions = {
        draggable:true
      }
      let marker: any = leaflet.marker([lat,long],markerOptions).on('dragend', (m) => {
        // console.log(m.target._latlng.lat);
        // console.log(m.target._latlng.lng);
        this.lat = m.target._latlng.lat;
        this.long = m.target._latlng.lng;
      });
      marker.addTo(this.map);
  }

  initMapNull() {
    if(this.map) {
      this.map.off();
      this.map.remove();
    }
    this.map = leaflet.map("map").setView([-7.3265676, 108.3537474], 9);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18
     }).addTo(this.map);
  }

  cekLokasi() {
    if(this.map) {
      this.map.stopLocate();
      this.map.remove();
      this.map = leaflet.map("map");
      leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18
     }).addTo(this.map);
    }

    this.map.locate({
      setView: true,
      maxZoom: 14,
      enableHighAccuracy: true
    }).once('locationfound', (e) => {
      let markerOptions = {
        draggable:true
      }
      this.lat = e.latitude;
      this.long = e.longitude;
      let marker: any = leaflet.marker([e.latitude, e.longitude],markerOptions).on('dragend', (m) => {
        // console.log(m.target._latlng.lat);
        // console.log(m.target._latlng.lng);
        this.lat = m.target._latlng.lat;
        this.long = m.target._latlng.lng;
      });
      marker.addTo(this.map);
      }).on('locationerror', (err) => {
          alert(err.message);
    })
  }

  ionViewDidLoad() {
    this.loadMap(this.uid);
    this.navBar.backButtonClick = (ev:UIEvent) => {
        this.showPromptBack();
      }
  }

  showPromptBack() {
  let prompt = this.alrtCtrl.create({
    title: 'Peringatan',
    message: "Yakin Membatalkan Ubah Profil?",
    buttons: [
    {
      text: 'Tidak',
      handler: data => {
        return
      }
    },
    {
      text: 'Yakin',
      handler: data => {
        this.navCtrl.setRoot("ProfilPage");
      }
    }
    ]
  });
  prompt.present();
}

showPromptReset(email) {
  let prompt = this.alrtCtrl.create({
    title: 'Peringatan',
    message: "Yakin Akan Menyetel Ulang Password?",
    buttons: [
    {
      text: 'Tidak',
      handler: data => {
        return
      }
    },
    {
      text: 'Yakin',
      handler: data => {
        this.prosesReset(email);
      }
    }
    ]
  });
  prompt.present();
}


prosesReset(email) {
  var auth = firebase.auth();
  var emailAddress = email;

  auth.sendPasswordResetEmail(emailAddress).then(()=>{
    alert('Selesai, Mohon Periksa Email Anda');
    this.navCtrl.setRoot("TabsPage");
  }).catch(function(error) {

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


  load(uid) {
    //menampilkan objek dari database
    this.profilRef$ = this.afDatabase.object(`user/${uid}`).valueChanges();
    this.profilRef$.subscribe( user => {
      this.user = user;
      this.onChange();
    } );
  }

  editUserFoto(user: User) {

    this.afDatabase.object(`user/${this.uid}`).update(this.user.foto&this.user.cover)
    .then(() => this.navCtrl.setRoot('ProfilPage'));
  }

  kecBanjar=[];
  unSliceBanjar;
  ongkirBanjar=false;
  onChangeBanjar(banjar) {
    this.unSliceBanjar = banjar;
    var tod = banjar.slice();
    this.kecBanjar = tod;
    var i;
    for (i = 0; i < this.kecBanjar.length; i++) {
      this.kecBanjar[i]="";
    } 
    this.ongkirBanjar=true;
  }

  kecCiamis=[];
  unSliceCiamis;
  ongkirCiamis=false;
  onChangeCiamis(ciamis) {
    this.unSliceCiamis = ciamis;
    var tod = ciamis.slice();
    this.kecCiamis = tod;
    var i;
    for (i = 0; i < this.kecCiamis.length; i++) {
      this.kecCiamis[i]="";
    } 
    this.ongkirCiamis=true;
  }

  kecPangandaran=[];
  unSlicePangandaran;
  ongkirPangandaran=false;
  onChangePangandaran(pangandaran) {
    this.unSlicePangandaran = pangandaran;
    var tod = pangandaran.slice();
    this.kecPangandaran = tod;
    var i;
    for (i = 0; i < this.kecPangandaran.length; i++) {
      this.kecPangandaran[i]="";
    } 
    this.ongkirPangandaran=true;
  }

  kecKotaTasikmalaya=[];
  unSliceKotaTasikmalaya;
  ongkirKotaTasikmalaya=false;
  onChangeKotaTasikmalaya(kotatasikmalaya) {
    this.unSliceKotaTasikmalaya = kotatasikmalaya;
    var tod = kotatasikmalaya.slice();
    this.kecKotaTasikmalaya = tod;
    var i;
    for (i = 0; i < this.kecKotaTasikmalaya.length; i++) {
      this.kecKotaTasikmalaya[i]="";
    } 
    this.ongkirKotaTasikmalaya=true;
  }

  kecKabTasikmalaya=[];
  unSliceKabTasikmalaya;
  ongkirKabTasikmalaya=false;
  onChangeKabTasikmalaya(kabtasikmalaya) {
    this.unSliceKabTasikmalaya = kabtasikmalaya;
    var tod = kabtasikmalaya.slice();
    this.kecKabTasikmalaya = tod;
    var i;
    for (i = 0; i < this.kecKabTasikmalaya.length; i++) {
      this.kecKabTasikmalaya[i]="";
    } 
    this.ongkirKabTasikmalaya=true;
  }

  kecGarut=[];
  unSliceGarut;
  ongkirGarut=false;
  onChangeGarut(garut) {
    this.unSliceGarut = garut;
    var tod = garut.slice();
    this.kecGarut = tod;
    var i;
    for (i = 0; i < this.kecGarut.length; i++) {
      this.kecGarut[i]="";
    } 
    this.ongkirGarut=true;
  }

  kecSumedang=[];
  unSliceSumedang;
  ongkirSumedang=false;
  onChangeSumedang(sumedang) {
    this.unSliceSumedang = sumedang;
    var tod = sumedang.slice();
    this.kecSumedang = tod;
    var i;
    for (i = 0; i < this.kecSumedang.length; i++) {
      this.kecSumedang[i]="";
    } 
    this.ongkirSumedang=true;
  }

  prosesOngkir(user: User) {
    if(this.ongkirCiamis==false) {
      this.unSliceCiamis = user.ciamis;
    }
    if(this.ongkirBanjar==false) {
      this.unSliceBanjar = user.banjar;
    }
    if(this.ongkirPangandaran==false) {
      this.unSlicePangandaran = user.pangandaran;
    }
    if(this.ongkirKotaTasikmalaya==false) {
      this.unSliceKotaTasikmalaya = user.kotatasikmalaya;
    }
    if(this.ongkirKabTasikmalaya==false) {
      this.unSliceKabTasikmalaya = user.kabtasikmalaya;
    }
    if(this.ongkirGarut==false) {
      this.unSliceGarut = user.garut;
    }
    if(this.ongkirSumedang==false) {
      this.unSliceSumedang = user.sumedang;
    }
    

    firebase.database().ref("user").child(this.uid).child("ongkir").remove();
    if(this.unSliceCiamis)
    {
      var i;
      user.ongkir=[];
      for (i = 0; i < this.unSliceCiamis.length; i++) {
        if(this.kecCiamis[i]) {
          user.ongkir[i]=this.kecCiamis[i];  
        } else {
          user.ongkir[i]=0;
        }

        firebase.database().ref("user").child(this.uid).child("ongkir").child("ciamis").child(this.unSliceCiamis[i]).set(user.ongkir[i]);  
      } 
      this.ongkirCiamis=false;
    }
    if(this.unSliceBanjar)
    {
      user.ongkir=[];
      for (i = 0; i < this.unSliceBanjar.length; i++) {

        if(this.kecBanjar[i]) {
          user.ongkir[i]=this.kecBanjar[i];  
        } else {
          user.ongkir[i]=0;
        }
        firebase.database().ref("user").child(this.uid).child("ongkir").child("banjar").child(this.unSliceBanjar[i]).set(user.ongkir[i]);  
      } 
      this.ongkirBanjar=false;
    }
    if(this.unSlicePangandaran)
    {
      user.ongkir=[];
      for (i = 0; i < this.unSlicePangandaran.length; i++) {

        if(this.kecPangandaran[i]) {
          user.ongkir[i]=this.kecPangandaran[i];  
        } else {
          user.ongkir[i]=0;
        }
        firebase.database().ref("user").child(this.uid).child("ongkir").child("pangandaran").child(this.unSlicePangandaran[i]).set(user.ongkir[i]);  
      } 
      this.ongkirPangandaran=false;
    }

    if(this.unSliceKotaTasikmalaya)
    {
      user.ongkir=[];
      for (i = 0; i < this.unSliceKotaTasikmalaya.length; i++) {

        if(this.kecKotaTasikmalaya[i]) {
          user.ongkir[i]=this.kecKotaTasikmalaya[i];  
        } else {
          user.ongkir[i]=0;
        }
        firebase.database().ref("user").child(this.uid).child("ongkir").child("kotatasikmalaya").child(this.unSliceKotaTasikmalaya[i]).set(user.ongkir[i]);  
      } 
      this.ongkirKotaTasikmalaya=false;
    }

    if(this.unSliceKabTasikmalaya)
    {
      user.ongkir=[];
      for (i = 0; i < this.unSliceKabTasikmalaya.length; i++) {

        if(this.kecKabTasikmalaya[i]) {
          user.ongkir[i]=this.kecKabTasikmalaya[i];  
        } else {
          user.ongkir[i]=0;
        }
        firebase.database().ref("user").child(this.uid).child("ongkir").child("kabtasikmalaya").child(this.unSliceKabTasikmalaya[i]).set(user.ongkir[i]);  
      } 
      this.ongkirKabTasikmalaya=false;
    }

    if(this.unSliceGarut)
    {
      user.ongkir=[];
      for (i = 0; i < this.unSliceGarut.length; i++) {

        if(this.kecGarut[i]) {
          user.ongkir[i]=this.kecGarut[i];  
        } else {
          user.ongkir[i]=0;
        }
        firebase.database().ref("user").child(this.uid).child("ongkir").child("garut").child(this.unSliceGarut[i]).set(user.ongkir[i]);  
      } 
      this.ongkirGarut=false;
    }

    if(this.unSliceSumedang)
    {
      user.ongkir=[];
      for (i = 0; i < this.unSliceSumedang.length; i++) {

        if(this.kecSumedang[i]) {
          user.ongkir[i]=this.kecSumedang[i];  
        } else {
          user.ongkir[i]=0;
        }
        firebase.database().ref("user").child(this.uid).child("ongkir").child("sumedang").child(this.unSliceSumedang[i]).set(user.ongkir[i]);  
      } 
      this.ongkirSumedang=false;
    }

  }


  editUser(user: User) {
    return new Promise((resolve) => {
      // console.log(this.lat);
      // console.log(this.long);
      this.user.lat = this.lat;
      this.user.long = this.long;
      if (this.user.jamBuka >= this.user.jamTutup) {
        alert('Jam Buka Tidak Boleh Lebih Akhir dari Jam Tutup');      
        return;
      }

      this.loading = this.loadingCtrl.create({
        content: 'Mengubah Profil'
      });
      this.loading.present();

      var query = firebase.database().ref("user").orderByChild("email").equalTo(user.email);
      query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
      //Memunculkan UID dari setiap data
      var key = childSnapshot.key;

      //Memunculkan setiap data dari UID tersebut
      var childData = childSnapshot.val();

    //Mengubah Data di Tabel Makanan
    firebase.database().ref("makanan").child(key).orderByKey()
    .once("value")
    .then(function(snapshopDagangan){
      snapshopDagangan.forEach(function(childSnapshopDagangan){
        var keyDagangan = childSnapshopDagangan.key;

        firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).child("ciamis").remove().then(()=> 
          firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).child("banjar").remove().then(()=>
            firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).child("pangandaran").remove().then(()=>
              firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).child("kotatasikmalaya").remove().then(()=>
                firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).child("kabtasikmalaya").remove().then(()=>
                  firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).child("garut").remove().then(()=>
                    firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).child("sumedang").remove().then(()=>
            firebase.database().ref("makanan").child(snapshopDagangan.key).child(keyDagangan).update(childData)
            )
          )
                 )))))
      })  
    }).then(()=>{
                //Mengubah Data di Tabel Barang
                firebase.database().ref("barang").child(key).orderByKey()
                .once("value")
                .then(function(snapshopDagangan){
                  snapshopDagangan.forEach(function(childSnapshopDagangan){
                    var keyDagangan = childSnapshopDagangan.key;


                    firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).child("ciamis").remove().then(()=> 
                      firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).child("banjar").remove().then(()=>
                        firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).child("pangandaran").remove().then(()=>
                          firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).child("kotatasikmalaya").remove().then(()=>
                            firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).child("kabtasikmalaya").remove().then(()=>
                              firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).child("garut").remove().then(()=>
                                firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).child("sumedang").remove().then(()=>
                        firebase.database().ref("barang").child(snapshopDagangan.key).child(keyDagangan).update(childData)
                        )
                      )
                        )))))
                  })  
                })

              }).then(()=>{
                //Mengubah Data di Tabel Jasa
                firebase.database().ref("jasa").child(key).orderByKey()
                .once("value")
                .then(function(snapshopDagangan){
                  snapshopDagangan.forEach(function(childSnapshopDagangan){
                    var keyDagangan = childSnapshopDagangan.key;
                    firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).child("ciamis").remove().then(()=> 
                      firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).child("banjar").remove().then(()=>
                        firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).child("pangandaran").remove().then(()=>
                          firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).child("kotatasikmalaya").remove().then(()=>
                            firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).child("kabtasikmalaya").remove().then(()=>
                              firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).child("garut").remove().then(()=>
                                firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).child("sumedang").remove().then(()=>
                        firebase.database().ref("jasa").child(snapshopDagangan.key).child(keyDagangan).update(childData)
                        )
                      )
                              )))))
                  })  
                })

              })
            });
      });

      this.afDatabase.object(`user/${this.uid}`).update(this.user)
      .then(() => {
        this.prosesOngkir(this.user);
        resolve(true);
      })
    }).then((x)=>{
      if(x)
      {
        this.navCtrl.setRoot('ProfilPage').then(()=>{
          this.loading.dismiss();
        })
      }
    })
  }

  changeCoverPicture(): void {
    let actionSheet = this.actionSheetCtrl.create({
      enableBackdropDismiss: true,
      buttons: [
      {
        text: 'Take a picture',
        icon: 'camera',
        handler: () => {
          this.uploadCamera(this.basePath='/cover/');
        }
      },
      {
        text: 'From gallery',
        icon: 'images',
        handler: () => {
          this.uploadFromGallery(this.basePath='/cover/');
        }
      }
      ]
    });
    actionSheet.present();
  }

  changePicture(): void {
    let actionSheet = this.actionSheetCtrl.create({
      enableBackdropDismiss: true,
      buttons: [
      {
        text: 'Take a picture',
        icon: 'camera',
        handler: () => {
          this.uploadCamera(this.basePath='/profil/');
        }
      },
      {
        text: 'From gallery',
        icon: 'images',
        handler: () => {
          this.uploadFromGallery(this.basePath='/profil/');
        }
      }
      ]
    });
    actionSheet.present();
  }

  async uploadCamera(basePath: string) {
    try {
      const options: CameraOptions = {
        quality: 50,
        targetHeight: 600,
        targetWidth: 600,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }

      const result = await this.camera.getPicture(options);
      
      this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present();
      const image = `data:image/jpeg;base64,${result}`;
      if(this.basePath=="/cover/") {
        this.basePath = "/cover/";
      } else {
        this.basePath="/fotoProfil/";
      }

      const pictures = storage().ref(this.basePath + this.user.email);
      pictures.putString(image, 'data_url').then(savePic=> {
        if(this.basePath=="/cover/") {
          this.user.cover = savePic.downloadURL;
        } else {
          this.user.foto = savePic.downloadURL;
        }
        this.saveToDatabase(savePic);
      });
      this.loading.dismiss();

    } catch (e) {
      console.error(e);
    }
  }

  private galleryOptions: CameraOptions = {
    allowEdit: true,
    quality: 50,
    destinationType: this.camera.DestinationType.FILE_URI,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    correctOrientation: true
  }
  
  //open the gallery and Return a promise with the image data
  async uploadFromGallery(basePath:string) {
    try {
      await this.camera.getPicture(this.galleryOptions).then((imagePath) => {
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();
        return this.makeFileIntoBlob(imagePath);//convert picture to blob
      }).then((imageBlob) => {
        return this.uploadToFirebase(imageBlob);//upload the blob
      }).then((uploadSnapshot: any) => {
        if(this.basePath=="/cover/") {
          this.user.cover = uploadSnapshot.downloadURL;
          //this.afDatabase.object(`user/${this.uid}`).update(this.user.cover);
        } else {
          this.user.foto = uploadSnapshot.downloadURL;
          //this.afDatabase.object(`user/${this.uid}`).update(this.user.foto);
        }
        return this.saveToDatabase(uploadSnapshot);//store reference to storage in database
      }).then((_uploadSnapshot: any) => {
        this.loading.dismiss();
        alert('Foto Berhasil Diunggah');
      }, (_error) => {
        alert('Error ' + (_error.message || _error));
      });
    } catch (e) {
      console.error(e);
    }
  }

  makeFileIntoBlob(_imagePath) {
    return new Promise((resolve, reject) => {
      window.resolveLocalFileSystemURL(_imagePath, (fileEntry) => {

        fileEntry.file((resFile) => {

          var reader = new FileReader();
          reader.onloadend = (evt: any) => {
            var imgBlob: any = new Blob([evt.target.result], { type: 'image/jpeg' });
            imgBlob.name = 'sample.jpg';
            resolve(imgBlob);
          };

          reader.onerror = (e) => {
            reject(e);
          };

          reader.readAsArrayBuffer(resFile);
        });
      });
    });
  }

  //Upload picture to the firebase storage
  uploadToFirebase(imgBlob: any) {
    return new Promise((resolve, reject) => {
      if(this.basePath=="/cover/") {
        this.basePath = "/cover/"
      } else {
        this.basePath="/fotoProfil/"
      }
      let storageRef = firebase.storage().ref(this.basePath + this.user.email);//Firebase storage main path

      let metadata: firebase.storage.UploadMetadata = {
        contentType: 'image/jpeg',
      };

      let uploadTask = storageRef.put(imgBlob, metadata);
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {
          // upload in progress
          let progress = (uploadTask.snapshot.bytesTransferred / uploadTask.snapshot.totalBytes) * 100
        },
        (error) => {
          // upload failed
          reject(error);
        },
        () => {
          // upload success
          let url = uploadTask.snapshot.downloadURL
          resolve(uploadTask.snapshot);
        });
    });
  }
  dataToSave;
  saveToDatabase(uploadSnapshot) {
    var dbRef = firebase.database().ref("user");
    var userRef = dbRef.child(this.uid);

    return new Promise((resolve, reject) => {
      if(this.basePath=="/cover/") {
        // we will save meta data of image in database
        this.dataToSave = {
          "cover": uploadSnapshot.downloadURL,
          "foto": this.user.foto
        };
      } else {
        this.dataToSave = {
          "cover": this.user.cover,
          "foto": uploadSnapshot.downloadURL
        };
      }
      userRef.update(this.dataToSave, (response) => {
        resolve(response);
      })
    });
  }

  onChange(){
    if (this.user.kabupaten=="Ciamis") {
      this.items = [
        { text: 'Banjarsari', value: 'Banjarsari' },
        { text: 'Baregbeg', value: 'Baregbeg' },
        { text: 'Ciamis', value: 'Ciamis Kota' },
        { text: 'Cidolog', value: 'Cidolog' },
        { text: 'Cihaurbeuti', value: 'Cihaurbeuti' },
        { text: 'Cijeungjing', value: 'Cijeungjing' },
        { text: 'Cikoneng', value: 'Cikoneng' },
        { text: 'Cimaragas', value: 'Cimaragas' },
        { text: 'Cipaku', value: 'Cipaku' },
        { text: 'Cisaga', value: 'Cisaga' },
        { text: 'Jatinagara', value: 'Jatinagara' },
        { text: 'Kawali', value: 'Kawali' },
        { text: 'Lakbok', value: 'Lakbok' },
        { text: 'Lumbung', value: 'Lumbung' },
        { text: 'Pamarican', value: 'Pamarican' },
        { text: 'Panawangan', value: 'Panawangan' },
        { text: 'Panjalu', value: 'Panjalu' },
        { text: 'Panumbangan', value: 'Panumbangan' },
        { text: 'Purwadadi', value: 'Purwadadi' },
        { text: 'Rajadesa', value: 'Rajadesa' },
        { text: 'Rancah', value: 'Rancah' },
        { text: 'Sadananya', value: 'Sadananya' },
        { text: 'Sindangkasih', value: 'Sindangkasih' },
        { text: 'Sukadana', value: 'Sukadana' },
        { text: 'Sukamantri', value: 'Sukamantri' },
        { text: 'Tambaksari', value: 'Tambaksari' },
        { text: 'Panjalu Utara', value: 'Panjalu Utara' }
      ];

    } else if(this.user.kabupaten=="Banjar") {

      this.items = [
        { text: 'Banjar', value: 'Banjar' },
        { text: 'Langensari', value: 'Langensari' },
        { text: 'Pataruman', value: 'Pataruman' },
        { text: 'Purwaharja', value: 'Purwaharja' }
      ];

    } else if (this.user.kabupaten=="Pangandaran") {
      this.items = [
      { text: 'Cigugur', value: 'Cigugur' },
      { text: 'Cijulang', value: 'Cijulang' },
      { text: 'Cimerak', value: 'Cimerak' },
      { text: 'Kalipucang', value: 'Kalipucang' },
      { text: 'Langkaplancar', value: 'Langkaplancar' },
      { text: 'Mangunjaya', value: 'Mangunjaya' },
      { text: 'Padaherang', value: 'Padaherang' },
      { text: 'Pangandaran', value: 'Pangandaran' },
      { text: 'Parigi', value: 'Parigi' },
      { text: 'Sidamulih', value: 'Sidamulih' }      
      ];
    } else if (this.user.kabupaten=="Kota Tasikmalaya") {
      this.items = [
      { text: 'Bungursari', value: 'Bungursari' },
      { text: 'Cibeureum', value: 'Cibeureum' },
      { text: 'Cihideung', value: 'Cihideung' },
      { text: 'Cipedes', value: 'Cipedes' },
      { text: 'Indihiang', value: 'Indihiang' },
      { text: 'Kawalu', value: 'Kawalu' },
      { text: 'Mangkubumi', value: 'Mangkubumi' },
      { text: 'Purbaratu', value: 'Purbaratu' },
      { text: 'Tamansari', value: 'Tamansari' },
      { text: 'Tawang', value: 'Tawang' }
      ];
    } else if (this.user.kabupaten=="Kab.Tasikmalaya") {
      this.items = [
      { text: 'Kadipaten', value: 'Kadipaten' },
      { text: 'Pagerageung', value: 'Pagerageung' },
      { text: 'Ciawi', value: 'Ciawi' },
      { text: 'Sukaresik', value: 'Sukaresik' },
      { text: 'Jamanis', value: 'Jamanis' },
      { text: 'Sukahening', value: 'Sukahening' },
      { text: 'Rajapolah', value: 'Rajapolah' },
      { text: 'Cisayong', value: 'Cisayong' },
      { text: 'Cigalontang', value: 'Cigalontang' },
      { text: 'Sariwangi', value: 'Sariwangi' },
      { text: 'Leuwisari', value: 'Leuwisari' },
      { text: 'Padakembang', value: 'Padakembang' },
      { text: 'Sukaratu', value: 'Sukaratu' },
      { text: 'Singaparna', value: 'Singaparna' },
      { text: 'Salawu', value: 'Salawu' },
      { text: 'Mangunreja', value: 'Mangunreja' },
      { text: 'Sukarame', value: 'Sukarame' },
      { text: 'Manonjaya', value: 'Manonjaya' },
      { text: 'Cineam', value: 'Cineam' },
      { text: 'Taraju', value: 'Taraju' },
      { text: 'Puspahiang', value: 'Puspahiang' },
      { text: 'Tanjungjaya', value: 'Tanjungjaya' },
      { text: 'Sukaraja', value: 'Sukaraja' },
      { text: 'Gunungtanjung', value: 'Gunungtanjung' },
      { text: 'Karangjaya', value: 'Karangjaya' },
      { text: 'Bojonggambir', value: 'Bojonggambir' },
      { text: 'Sodonghilir', value: 'Sodonghilir' },
      { text: 'Parungponteng', value: 'Parungponteng' },
      { text: 'Jatiwaras', value: 'Jatiwaras' },
      { text: 'Salopa', value: 'Salopa' },
      { text: 'Culamega', value: 'Culamega' },
      { text: 'Bantarkalong', value: 'Bantarkalong' },
      { text: 'Bojongasih', value: 'Bojongasih' },
      { text: 'Cibalong', value: 'Cibalong' },
      { text: 'Cikatomas', value: 'Cikatomas' },
      { text: 'Cipatujah', value: 'Cipatujah' },
      { text: 'Karangnunggal', value: 'Karangnunggal' },
      { text: 'Cikalong', value: 'Cikalong' },
      { text: 'Pancatengah', value: 'Pancatengah' }
      ];
    } else if (this.user.kabupaten=="Garut") {
      this.items = [
      { text: 'Banjarwangi', value: 'Banjarwangi' },
      { text: 'Banyuresmi', value: 'Banyuresmi' },
      { text: 'Bayongbong', value: 'Bayongbong' },
      { text: 'Balubur Limbangan', value: 'Balubur Limbangan' },
      { text: 'Bungbulang', value: 'Bungbulang' },
      { text: 'Caringin', value: 'Caringin' },
      { text: 'Cibalong', value: 'Cibalong' },
      { text: 'Cibatu', value: 'Cibatu' },
      { text: 'Cibiuk', value: 'Cibiuk' },
      { text: 'Cigedug', value: 'Cigedug' },
      { text: 'Cihurip', value: 'Cihurip' },
      { text: 'Cikajang', value: 'Cikajang' },
      { text: 'Cikelet', value: 'Cikelet' },
      { text: 'Cilawu', value: 'Cilawu' },
      { text: 'Cisewu', value: 'Cisewu' },
      { text: 'Cisompet', value: 'Cisompet' },
      { text: 'Cisurupan', value: 'Cisurupan' },
      { text: 'Garut Kota', value: 'Garut Kota' },
      { text: 'Kadungora', value: 'Kadungora' },
      { text: 'Karangpawitan', value: 'Karangpawitan' },
      { text: 'Karangtengah', value: 'Karangtengah' },
      { text: 'Kersamanah', value: 'Kersamanah' },
      { text: 'Leles', value: 'Leles' },
      { text: 'Leuwigoong', value: 'Leuwigoong' },
      { text: 'Malangbong', value: 'Malangbong' },
      { text: 'Mekarmukti', value: 'Mekarmukti' },
      { text: 'Pakenjeng', value: 'Pakenjeng' },
      { text: 'Pameungpeuk', value: 'Pameungpeuk' },
      { text: 'Pamulihan', value: 'Pamulihan' },
      { text: 'Pangatikan', value: 'Pangatikan' },
      { text: 'Pasirwangi', value: 'Pasirwangi' },
      { text: 'Peundeuy', value: 'Peundeuy' },
      { text: 'Samarang', value: 'Samarang' },
      { text: 'Selaawi', value: 'Selaawi' },
      { text: 'Singajaya', value: 'Singajaya' },
      { text: 'Sucinaraja', value: 'Sucinaraja' },
      { text: 'Sukaresmi', value: 'Sukaresmi' },
      { text: 'Sukawening', value: 'Sukawening' },
      { text: 'Talegong', value: 'Talegong' },
      { text: 'Tarogong Kaler', value: 'Tarogong Kaler' },
      { text: 'Tarogong Kidul', value: 'Tarogong Kidul' },
      { text: 'Wanaraja', value: 'Wanaraja' }
      ];
    }
    else if (this.user.kabupaten=="Sumedang") {
      this.items = [
      { text: 'Buahdua', value: 'Buahdua' },
      { text: 'Cibugel', value: 'Cibugel' },
      { text: 'Cimalaka', value: 'Cimalaka' },
      { text: 'Cimanggung', value: 'Cimanggung' },
      { text: 'Cisarua', value: 'Cisarua' },
      { text: 'Cisitu', value: 'Cisitu' },
      { text: 'Conggeang', value: 'Conggeang' },
      { text: 'Darmaraja', value: 'Darmaraja' },
      { text: 'Ganeas', value: 'Ganeas' },
      { text: 'Jatigede', value: 'Jatigede' },
      { text: 'Jatinangor', value: 'Jatinangor' },
      { text: 'Jatinunggal', value: 'Jatinunggal' },
      { text: 'Pamulihan', value: 'Pamulihan' },
      { text: 'Paseh', value: 'Paseh' },
      { text: 'Rancakalong', value: 'Rancakalong' },
      { text: 'Situraja', value: 'Situraja' },
      { text: 'Sukasari', value: 'Sukasari' },
      { text: 'Sumedang Selatan', value: 'Sumedang Selatan' },
      { text: 'Sumedang Utara', value: 'Sumedang Utara' },
      { text: 'Surian', value: 'Surian' },
      { text: 'Tanjungkerta', value: 'Tanjungkerta' },
      { text: 'Tanjungmedar', value: 'Tanjungmedar' },
      { text: 'Tanjungsari', value: 'Tanjungsari' },
      { text: 'Tomo', value: 'Tomo' },
      { text: 'Ujung Jaya', value: 'Ujung Jaya' },
      { text: 'Wado', value: 'Wado' }
      ];
    }

  }

  resizeD() {
    var element = this.myInputD['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.myInputD['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
  }

  resize() {
    var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
  }

}