import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, Refresher, Platform } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { size } from "lodash";
import * as firebase from 'firebase/app';
import * as moment from 'moment';
import { Clipboard } from '@ionic-native/clipboard';

import { User } from '../../models/user';
import { Ikuti } from '../../models/ikuti';
import { Notifikasi } from '../../models/notifikasi';
import leaflet from 'leaflet';

 @IonicPage()
 @Component({
   selector: 'page-profil',
   templateUrl: 'profil.html',
 })
 export class ProfilPage {

   @ViewChild('profilmap') mapContainer: ElementRef;
   profilmap: any;


   following = false;
   profileData: Observable<any>;
   notifikasi = {} as Notifikasi;

   uid:any;
   user = {} as User;
   ikuti = {} as Ikuti;
   profileSub: any;
   makanan$: Array<any>;
   barang$: Array<any>;
   jasa$: Array<any>;

   loading;

   keyUser;
   diikuti;
   jumlahPengikut=0;
   jumlahMakanan=0;
   jumlahBarang=0;
   jumlahJasa=0;
   jumlahDagangan=0;
   jumlahUlasan=0;
   rating=0;
   pengikut$: Array<any>;
   currentUser;
   tombolUbah = false;
   cod=[];
   DECIMAL_SEPARATOR=",";
   GROUP_SEPARATOR=".";
   refresh=false;
   verified=false;
   jumlah=Object();

   constructor(public navCtrl: NavController, public afAuth: AngularFireAuth, public toastCtrl: ToastController, public plt: Platform, 
     private afDatabase: AngularFireDatabase, public navParams: NavParams, public loadingCtrl: LoadingController, 
     private clipboard: Clipboard ) { 
     this.keyUser = navParams.get('keyUser');
     this.refresh = navParams.get('refresh');

     this.jumlah.like=0;
     this.jumlah.komentar=0;
     this.jumlah.ulasan=0;

     plt.registerBackButtonAction(() => {
       this.navCtrl.setRoot('TabsPage');
    });

        
   }
  
  // ionViewCanLeave(){
  //   document.getElementById("map").outerHTML = "";
  // }

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

  initMap(lat,long) {
    if(this.profilmap) {
      this.profilmap.off();
      this.profilmap.remove();
    }
    document.getElementById('profilmap').innerHTML = "<div id='profilmap' style='width: 100%; height: 25vh;'></div>";
    this.profilmap = leaflet.map("profilmap").setView([lat, long], 14);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18
     }).addTo(this.profilmap);

      let markerGroup = leaflet.featureGroup();
      let marker: any = leaflet.marker([lat, long]);
      markerGroup.addLayer(marker);
      this.profilmap.addLayer(markerGroup);

    //this.profilmap = leaflet.map("map").fitWorld();
    // this.profilmap.locate({
    //   setView: true,
    //   maxZoom: 14
    // }).on('locationfound', (e) => {
    //   let markerGroup = leaflet.featureGroup();
    //   let marker: any = leaflet.marker([e.latitude, e.longitude]).on('click', () => {
    //     alert('Marker clicked');
    //   })
    //   markerGroup.addLayer(marker);
    //   this.profilmap.addLayer(markerGroup);
    //   }).on('locationerror', (err) => {
    //     alert(err.message);
    // })
  }

  initMapNull() {
    if(this.profilmap) {
      this.profilmap.off();
      this.profilmap.remove();
    }
    document.getElementById('profilmap').innerHTML = "<div id='profilmap' style='width: 100%; height: 25vh;'></div>";
    this.profilmap = leaflet.map("profilmap").setView([-7.3265676, 108.3537474], 9);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18
     }).addTo(this.profilmap);
  }

   ionViewWillEnter() {
     this.currentUser = firebase.auth().currentUser;
     this.loading = this.loadingCtrl.create({
       content: 'Mengambil Data'
     });
     this.loading.present();

     //cek jika sudah login
     if(this.currentUser!==null) {
       //pemilik
       if(this.keyUser==undefined) {
         this.uid = this.currentUser.uid;
         this.tombolUbah = true;
         this.verified = this.currentUser.emailVerified;
         this.hitungNotif(this.uid);
         this.loadMap(this.uid);
       } else {
         //bukan pemilik
         this.uid = this.keyUser;
         this.loadMap(this.uid);
               //pemilik lihat dari link luar
               if (this.uid==this.currentUser.uid) {
                 this.tombolUbah = true;
               } else {
                 this.tombolUbah = false;
               }
             }


             this.loadMakanan(this.uid).then(()=>{
               this.cekIkuti();
               this.loadBarang(this.uid).then(()=>{
                 this.cekPengikut();
                 this.loadJasa(this.uid).then((x) => {
                   if (x) this.loading.dismiss();
                 }).then(()=> {
                   this.hitungDagangan();
                   this.hitungUlasan(this.uid);
                   this.loadCOD();
                 });    
               })  
             });
             
             this.profileData = this.afDatabase.object(`user/${this.uid}`).valueChanges();

           } else {
             if(this.keyUser==undefined) {
               alert("Anda Harus Login Terlebih Dahulu");
               this.navCtrl.setRoot("LoginPage");
               this.loading.dismiss();
               return;
             } else {
               this.uid = this.keyUser;
               this.loadMap(this.uid);
               this.loadMakanan(this.uid).then(()=>{
         //this.cekIkuti();
         this.loadBarang(this.uid).then(()=>{
           this.cekPengikut();
           this.loadJasa(this.uid).then((x) => {
             if (x) this.loading.dismiss();
           }).then(()=> {
             this.hitungDagangan();
             this.hitungUlasan(this.uid);
           });    
         })  
       });
               this.profileData = this.afDatabase.object(`user/${this.uid}`).valueChanges();
             }
           }
           if(this.refresh) {
             this.navCtrl.setRoot("ProfilPage",{refresh:false});
           }
         }

         format(valString) {
           if(valString==0){
             return 0;
           } else
           if (!valString) {
             return '';
           }
           let val = valString.toString();
           const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
           return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR) + (!parts[1] ? '' : this.DECIMAL_SEPARATOR + parts[1]);
         };

         unFormat(val) {
           if (!val) {
             return '';
           }
           val = val.replace(/^0+/, '');

           if (this.GROUP_SEPARATOR === ',') {
             return val.replace(/,/g, '');
           } else {
             return val.replace(/\./g, '');
           }
         };

         loadCOD() {
           var cod=[];
           firebase.database().ref("user").child(this.uid).child("ongkir").once("value")
           .then(function(snapshot) {
             snapshot.forEach(function(childSnapshot) {
               var kabupaten: string;
               if (childSnapshot.key=="banjar") {
                 kabupaten = "Kota "+childSnapshot.key;
               } else 
               if (childSnapshot.key=="kabtasikmalaya") {
                 kabupaten = "Kab.Tasikmalaya ";
               } else 
               if (childSnapshot.key=="kotatasikmalaya") {
                 kabupaten = "Kota Tasikmalaya";
               } 
               else {
                 kabupaten = "Kab. "+childSnapshot.key;
               }
               Object.keys(childSnapshot.val()).forEach(function(key) {
                 cod.push({
                   kabupaten: kabupaten,
                   wilayah: key,
                   ongkir: childSnapshot.val()[key]
                 })
               })
               

             })
             return cod;
           })
           this.cod = cod;
         }

         copyHp(hp) {
           this.clipboard.copy(hp).then((x) => {
             alert(hp+" telah disalin")
           });
         }

         lihatPelanggan() {
           this.navCtrl.push("PelangganPage",{pelanggan:this.pengikut$})
         }

         hitungUlasan(idPenjual) {
           firebase.database().ref("ulasan").orderByChild("keyPenjual").equalTo(idPenjual)
           .once("value")
           .then(function(snapshotUlasan) {
             var sizeUlasan = size(snapshotUlasan.val());
             var ratingUlasan=0;
             snapshotUlasan.forEach(function(childSnapshot) {
               ratingUlasan = ratingUlasan+childSnapshot.val().rating;

             })

             return [sizeUlasan,ratingUlasan];
           }).then(([x,y])=>{
             if(x==0) {
               this.jumlahUlasan = x;
               this.rating = 0;
             } else {
               this.jumlahUlasan = x;
               this.rating = y/x;
               this.rating = this.roundUp(this.rating,1);
             }
           })
         }

         headerMakanan:string;
         headerBarang:string;
         headerJasa:string;
         hitungDagangan() {
           this.jumlahDagangan = this.jumlahMakanan+this.jumlahBarang+this.jumlahJasa;
           this.headerMakanan = "Makanan ("+this.jumlahMakanan.toString()+")";
           this.headerBarang = "Barang ("+this.jumlahBarang.toString()+")";
           this.headerJasa = "Jasa ("+this.jumlahJasa.toString()+")";
         }

         cekPengikut() {
     //tampilkan semua user=keypengikut where this.uid=keydiikuti
     var arrayPengikut=[];
     var jumlahPengikut=[];
     
     var queryPengkut = firebase.database().ref("diikuti").child(this.uid);
     queryPengkut.once("value")
     .then(function(snapshotPengikut) {
       
       jumlahPengikut.push(size(snapshotPengikut.val()));

       snapshotPengikut.forEach(function(childSnapshotPengikut) {
         firebase.database().ref("user").orderByKey().equalTo(childSnapshotPengikut.key)
         .once("value")
         .then(function(snapshotDiikuti) {
           snapshotDiikuti.forEach(function(childSnapshotDiikuti) {
             arrayPengikut.push({
               keyUser : childSnapshotDiikuti.key,
               dataUser : childSnapshotDiikuti.val()
             });
             
           })
         })
       })
       return [arrayPengikut,jumlahPengikut];
     }).then(()=> {
       this.pengikut$ = arrayPengikut;
       this.jumlahPengikut = jumlahPengikut[0];
     })
     
   }


   cekIkuti() {
     var diikuti=[];     
     firebase.database().ref("mengikuti").child(this.afAuth.auth.currentUser.uid).child(this.uid)
     .once("value")
     .then(function(cekIkuti){
       diikuti.push(cekIkuti.val());

       return diikuti;
     }).then(()=>{
       this.diikuti = diikuti[0];
       if (this.diikuti=="true") {
         this.following=true;
       } else {
         this.following=false;
       }
     })
     
     
   }

   jadiPengikut() {
     this.following = !this.following;
     this.ikuti.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
     const orderNumber = Math.floor(0-Date.now());
     this.ikuti.order = orderNumber;

     firebase.database().ref("mengikuti").child(this.afAuth.auth.currentUser.uid).child(this.uid).set("true").then(()=>{
       firebase.database().ref("diikuti").child(this.uid).child(this.afAuth.auth.currentUser.uid).set("true")
     });
   }

   batalIkut() {

     this.following = !this.following;
     this.ikuti.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
     const orderNumber = Math.floor(0-Date.now());
     this.ikuti.order = orderNumber;
     this.ikuti.keyDiikuti = this.uid;
     this.ikuti.keyPengikut = this.afAuth.auth.currentUser.uid;

     firebase.database().ref("mengikuti").child(this.afAuth.auth.currentUser.uid).child(this.uid).remove();
   }

   loadMakanan(uid) {
     return new Promise((resolve) => {
       var arrayDaganganData=[];
       var jumlahMakanan=[];

       var queryDagangan = firebase.database().ref("makanan").child(uid).orderByChild('order');

       queryDagangan.once("value")
       .then(function(snapshopDagangan){
         jumlahMakanan.push(size(snapshopDagangan.val()));
         snapshopDagangan.forEach(function(childSnapshopDagangan){
           var kunciDagangan = childSnapshopDagangan.key;
           var childDaganganData = childSnapshopDagangan.val();

                     //cek ongkir
                     var cod=[];
                     var ongkir=Object();
                     firebase.database().ref("user").child(uid).child("ongkir").once("value")
                     .then(function(snapshot) {
                       snapshot.forEach(function(childSnapshot) {
                         
                         Object.keys(childSnapshot.val()).forEach(function(key) {
                           cod.push(Number(childSnapshot.val()[key]))
                         })
                       })
                       return [Math.min(...cod),Math.max(...cod)];
                     }).then(([x,y])=>{
                       if(x==Infinity){
                         x=0;
                       }

                       if(y==-Infinity){
                         y=0;
                       }
                       ongkir.min = x;
                       ongkir.max = y;

                       return ongkir;
                     })

                      //cek sudah like
                      var disukai=Object();
                      firebase.database().ref("user").child(uid).child("like").child(kunciDagangan).once("value")
                      .then(function(snapshot) {
                        disukai.suka = snapshot.val();
                        
                        return disukai;
                      });

                      var jumlahUlasan=0;
                      var rate = 0;
                      var ulas=Object();
                      firebase.database().ref("ulasan").orderByChild("keyDagangan").equalTo(kunciDagangan).once("value")
                      .then(function(snapshotUlasan) {
                        jumlahUlasan = size(snapshotUlasan.val());
                        
                        snapshotUlasan.forEach(function(childSnapshotUlasan) {
                          rate = childSnapshotUlasan.val().rating+rate; 
                        })
                        return [rate,jumlahUlasan];
                          //return ulasan;
                        }).then(()=> {
                          if (rate==0&&jumlahUlasan==0) {
                            ulas.rate = rate;
                            ulas.jumlah = jumlahUlasan;  
                          } else {
                            ulas.rate = rate/jumlahUlasan;
                            ulas.jumlah = jumlahUlasan;  
                          }
                          
                        })

                        var jumlahLike = size(childDaganganData.liker);
                        
                        arrayDaganganData.push({
                          keyUser : uid,
                          keyDagangan: kunciDagangan,
                          jumlahLike: jumlahLike,
                          dagang: childDaganganData,
                          ulasan: ulas,
                          disukai: disukai,
                          ongkir: ongkir
                        });
                      });
         resolve(true);
         return [arrayDaganganData,jumlahMakanan];
       }).then(()=>{
         this.makanan$ = arrayDaganganData;
         this.jumlahMakanan = jumlahMakanan[0];
       });
     })
   }

   loadBarang(uid) {
     return new Promise((resolve) => {
       var arrayDaganganDataBarang=[];
       var jumlahBarang=[];
       var queryDagangan = firebase.database().ref("barang").child(uid).orderByChild('order');

       queryDagangan.once("value")
       .then(function(snapshopDagangan){
         jumlahBarang.push(size(snapshopDagangan.val()));
         snapshopDagangan.forEach(function(childSnapshopDagangan){
           var kunciDagangan = childSnapshopDagangan.key;
           var childDaganganData = childSnapshopDagangan.val();

                       //cek ongkir
                       var cod=[];
                       var ongkir=Object();
                       firebase.database().ref("user").child(uid).child("ongkir").once("value")
                       .then(function(snapshot) {
                         snapshot.forEach(function(childSnapshot) {
                           
                           Object.keys(childSnapshot.val()).forEach(function(key) {
                             cod.push(Number(childSnapshot.val()[key]))
                           })
                         })
                         return [Math.min(...cod),Math.max(...cod)];
                       }).then(([x,y])=>{
                         if(x==Infinity){
                           x=0;
                         }

                         if(y==-Infinity){
                           y=0;
                         }
                         ongkir.min = x;
                         ongkir.max = y;

                         return ongkir;
                       })

                       //cek sudah like
                       var disukai=Object();
                       firebase.database().ref("user").child(uid).child("like").child(kunciDagangan).once("value")
                       .then(function(snapshot) {
                         disukai.suka = snapshot.val();
                         
                         return disukai;
                       });
                       
                       var jumlahUlasan=0;
                       var rate = 0;
                       var ulas=Object();
                       firebase.database().ref("ulasan").orderByChild("keyDagangan").equalTo(kunciDagangan).once("value")
                       .then(function(snapshotUlasan) {
                         jumlahUlasan = size(snapshotUlasan.val());
                         
                         snapshotUlasan.forEach(function(childSnapshotUlasan) {
                           rate = childSnapshotUlasan.val().rating+rate; 
                         })
                         return [rate,jumlahUlasan];
                          //return ulasan;
                        }).then(()=> {
                          if (rate==0&&jumlahUlasan==0) {
                            ulas.rate = rate;
                            ulas.jumlah = jumlahUlasan;  
                          } else {
                            ulas.rate = rate/jumlahUlasan;
                            ulas.jumlah = jumlahUlasan;  
                          }
                        })

                        var jumlahLike = size(childDaganganData.liker);
                        
                        arrayDaganganDataBarang.push({
                          keyUser : uid,
                          keyDagangan: kunciDagangan,
                          jumlahLike: jumlahLike,
                          dagang: childDaganganData,
                          ulasan: ulas,
                          disukai: disukai,
                          ongkir: ongkir
                        });
                      });
         resolve(true);
         return [arrayDaganganDataBarang,jumlahBarang];
       }).then(()=> {
         this.barang$ = arrayDaganganDataBarang;
         this.jumlahBarang = jumlahBarang[0];
       });
     })
   }

   loadJasa(uid) {
     return new Promise((resolve) => {

       var arrayDaganganDataJasa=[];
       var jumlahJasa=[];
       var queryDagangan = firebase.database().ref("jasa").child(uid).orderByChild('order');

       queryDagangan.once("value")
       .then(function(snapshopDagangan){
         jumlahJasa.push(size(snapshopDagangan.val()));
         snapshopDagangan.forEach(function(childSnapshopDagangan){
           var kunciDagangan = childSnapshopDagangan.key;
           var childDaganganData = childSnapshopDagangan.val();

                      //cek ongkir
                      var cod=[];
                      var ongkir=Object();
                      firebase.database().ref("user").child(uid).child("ongkir").once("value")
                      .then(function(snapshot) {
                        snapshot.forEach(function(childSnapshot) {
                          
                          Object.keys(childSnapshot.val()).forEach(function(key) {
                            cod.push(Number(childSnapshot.val()[key]))
                          })
                        })
                        return [Math.min(...cod),Math.max(...cod)];
                      }).then(([x,y])=>{
                        if(x==Infinity){
                          x=0;
                        }

                        if(y==-Infinity){
                          y=0;
                        }
                        ongkir.min = x;
                        ongkir.max = y;

                        return ongkir;
                      })

                       //cek sudah like
                       var disukai=Object();
                       firebase.database().ref("user").child(uid).child("like").child(kunciDagangan).once("value")
                       .then(function(snapshot) {
                         disukai.suka = snapshot.val();
                         
                         return disukai;
                       });
                       var jumlahUlasan=0;
                       var rate = 0;
                       var ulas=Object();
                       firebase.database().ref("ulasan").orderByChild("keyDagangan").equalTo(kunciDagangan).once("value")
                       .then(function(snapshotUlasan) {
                         jumlahUlasan = size(snapshotUlasan.val());
                         
                         snapshotUlasan.forEach(function(childSnapshotUlasan) {
                           rate = childSnapshotUlasan.val().rating+rate; 
                         })
                         return [rate,jumlahUlasan];
                       }).then(()=> {
                         if (rate==0&&jumlahUlasan==0) {
                           ulas.rate = rate;
                           ulas.jumlah = jumlahUlasan;  
                         } else {
                           ulas.rate = rate/jumlahUlasan;
                           ulas.jumlah = jumlahUlasan;  
                         }
                         
                       })

                       var jumlahLike = size(childDaganganData.liker);
                       
                       arrayDaganganDataJasa.push({
                         keyUser : uid,
                         keyDagangan: kunciDagangan,
                         jumlahLike: jumlahLike,
                         dagang: childDaganganData,
                         ulasan: ulas,
                         disukai: disukai,
                         ongkir: ongkir
                       });

                     });
         resolve(true);
         return [arrayDaganganDataJasa,jumlahJasa];
       }).then(()=>{
         this.jasa$ = arrayDaganganDataJasa;
         this.jumlahJasa = jumlahJasa[0];
         
       });
     })
   }

   lihatDetail(item) {
     this.navCtrl.push('DetailPage',{item: item});
   }

   likerUid;
   like(item) {
     this.likerUid = firebase.auth().currentUser.uid;

     var querySudahLike  = firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan);
     querySudahLike.once("value", snapshot => {

       const userData = snapshot.val();

       if (userData){
      //nambah Liker di makanan
      firebase.database().ref(item.dagang.jenis.toLowerCase()).child(item.keyUser).child(item.keyDagangan).child("liker").child(this.likerUid).remove();
      
      //nambah like di user
      firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan).remove();

      item.jumlahLike = item.jumlahLike-1;
      //this.buttonColor = "primary";
      item.disukai.suka = !item.disukai.suka;
      this.toastCtrl.create({
        message: `${item.dagang.namaDagangan}, batal disukai`,
        duration: 3000,position: 'top'
      }).present();      
      
    } else {
      //nambah Liker di makanan
      firebase.database().ref(item.dagang.jenis.toLowerCase()).child(item.keyUser).child(item.keyDagangan).child("liker").child(this.likerUid).set("true");
      
      //nambah like di user
      firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan).set("true");

      if(this.likerUid!=item.keyUser) {
        this.notifikasi.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
        this.notifikasi.keyPelaku = this.likerUid;
        this.notifikasi.keyPedagang = item.keyUser;
        this.notifikasi.keyDagangan = item.keyDagangan;
        this.notifikasi.namaDagangan = item.dagang.namaDagangan;
        this.notifikasi.fotoDagangan = item.dagang.fotoDagangan;
        this.notifikasi.jenisDagangan = item.dagang.jenis.toLowerCase();
        this.notifikasi.jenis = "like";
        this.notifikasi.aktif = true;

        //nambah notifikasi like
        firebase.database().ref("notifikasi").child(item.keyUser).child("like").push(this.notifikasi);
      }

      item.jumlahLike = item.jumlahLike+1;
      //this.buttonColor = "primary-light";
      item.disukai.suka = !item.disukai.suka;  
      this.toastCtrl.create({
        message: `${item.dagang.namaDagangan}, telah disukai`,
        duration: 3000,position: 'top'
      }).present();      
    }

  })
   }

   edit() {
     this.navCtrl.push('EditProfilPage',{cod : this.cod});
   } 
   tambahDagangan() {
     this.navCtrl.push('TambahDaganganPage');
   }

   roundUp(num, precision) {
     precision = Math.pow(10, precision)
     return Math.ceil(num * precision) / precision
   }

   doRefresh(refresher: Refresher) {
     this.ionViewWillEnter();
     
     setTimeout(() => {
       refresher.complete();

       const toast = this.toastCtrl.create({
         message: 'Telah Dimuat Ulang',
         duration: 3000
       });
       toast.present();

     }, 1000);
   }

   verifikasi() {
    // var actionCodeSettings = {
    //   url: 'https://h54g4.app.goo.gl/?emailVerified=true',
    //   android: {
    //     packageName: 'com.daragang.app',
    //     installApp: true,
    //     minimumVersion: '12'
    //   },
    //   handleCodeInApp: true
    // };

    if(this.currentUser.emailVerified){
      alert("Anda Sudah Verifikasi Email");
      return;
    } else {
      this.currentUser.sendEmailVerification().then(()=>{
        alert("Link Verifikasi Telah Dikirimkan Ke Email Anda");
      })
      .catch(function(error) {
        alert(error.message);
      });
    }
  }

  hitungNotif(uid) {
    var jumlah=Object();
    jumlah.like=0;
    jumlah.komentar=0;
    jumlah.ulasan=0;

    firebase.database().ref("notifikasi").child(uid).once("value").then(function(snapshop){

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