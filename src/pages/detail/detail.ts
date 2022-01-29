import { Component, ElementRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, ToastController, NavParams, Navbar, LoadingController,
  AlertController, ActionSheetController, Refresher, Platform } from 'ionic-angular';
  import { SocialSharing } from '@ionic-native/social-sharing';
  import * as moment from 'moment';
  import { AngularFireAuth } from 'angularfire2/auth';
  import * as firebase from 'firebase/app';
  import 'firebase/storage';
  import { Clipboard } from '@ionic-native/clipboard';
  import { ImageViewerController } from 'ionic-img-viewer';
  import {Camera, CameraOptions} from '@ionic-native/camera';

  import { Komentar } from '../../models/komentar';
  import { Ulasan } from '../../models/ulasan';
  import { Notifikasi } from '../../models/notifikasi';
  import leaflet from 'leaflet';

  @IonicPage()
  @Component({
    selector: 'page-detail',
    templateUrl: 'detail.html',
  })
  export class DetailPage {
    @ViewChild('navbar') navBar: Navbar;
    @ViewChild('detailmap') mapContainer: ElementRef;
    detailmap: any;

    _imageViewerCtrl: ImageViewerController;

    item;
    komentar = {} as Komentar;
    komentar$ : Array<any>;
    ulasan = {} as Ulasan;
    ulasan$ : Array<any>;
    keyKomentarKomentator;
    loading;
    isiBalasan;
    isiBalasanUlasan;
    keyKomentarGlobal;
    balasan$;
    pemilik=false;
    currentUser;
    edited=false;
    komentardanulasan:string = "komentar";
    notifikasi = {} as Notifikasi;


    selectedPhoto;
    currentImage;
    imageName;
    authId;
    captureDataUrl: string;

    cod=[];
    DECIMAL_SEPARATOR=",";
    GROUP_SEPARATOR=".";

    isiUbahKomentar=[];
    isiUbahBalasan=[];
    isiUbahUlasan=[];
    isiRatingUlasan=[];

    yangIni=[];
    yangIniBalasan=[];
    yangIniBalasanParent=[];
    yangIniUlasan=[];

    currentUbahImage=[];
    rating:number;
    angkaRating:string;

    constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public navParams: NavParams, private socialSharing: SocialSharing,
      public afAuth: AngularFireAuth, private clipboard: Clipboard, private alrtCtrl : AlertController, imageViewerCtrl: ImageViewerController,
      public actionSheetCtrl: ActionSheetController, private camera : Camera, private toastCtrl: ToastController, public plt: Platform) {
      this.item = navParams.get('item');
      this.edited = navParams.get('edited');

      this.rating = this.roundUp(this.item.ulasan.rate,1);
      this.angkaRating = this.rating.toString()+"("+this.item.ulasan.jumlah+")";


      this._imageViewerCtrl = imageViewerCtrl;
      this.currentUser = firebase.auth().currentUser;

    //console.log(this.currentUser);
    if(this.currentUser==null) {
      this.pemilik=false;
    } else {
      if(this.item.keyUser==this.currentUser.uid) {
        this.pemilik=true;
      } else {
        this.pemilik=false;
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

  initMap(lat,long) {
    if(this.detailmap) {
      this.detailmap.off();
      this.detailmap.remove();
    }
    document.getElementById('detailmap').innerHTML = "<div id='detailmap' style='width: 100%; height: 25vh;'></div>";
    this.detailmap = leaflet.map("detailmap").setView([lat, long], 14);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18
     }).addTo(this.detailmap);

      let markerGroup = leaflet.featureGroup();
      let marker: any = leaflet.marker([lat, long]);
      markerGroup.addLayer(marker);
      this.detailmap.addLayer(markerGroup);
  }

  initMapNull() {
    if(this.detailmap) {
      this.detailmap.off();
      this.detailmap.remove();
    }
    document.getElementById('detailmap').innerHTML = "<div id='detailmap' style='width: 100%; height: 25vh;'></div>";
    this.detailmap = leaflet.map("detailmap").setView([-7.3265676, 108.3537474], 9);
    leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attributions: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
       maxZoom: 18
     }).addTo(this.detailmap);
  }

  ionViewWillLeave() {
    this.plt.registerBackButtonAction(() => {
       this.navCtrl.setRoot('TabsPage');
    });
  }

  // ionViewCanLeave(){
  //   document.getElementById("map").outerHTML = "";
  // }

  ionViewDidLoad() {
    this.loadMap(this.item.keyUser);
    this.plt.registerBackButtonAction(() => {
       this.navCtrl.pop();
    });
    this.loading = this.loadingCtrl.create({
      content: 'Mengambil Data'
    });
    this.loading.present();
    this.loadKomentar().then(()=> {
      this.loadUlasan().then(()=> {
        this.loadCOD();
        if(this.edited) {
          this.navBar.backButtonClick = (ev:UIEvent) => {
            this.navCtrl.setRoot("ProfilPage");
          }
        }
      }).then(() => {
        this.loading.dismiss();
      });
    });
  }


  loadingKomentar() {
    this.loading = this.loadingCtrl.create({
      content: 'Mengirim Komentar'
    });
    this.loading.present();
    this.loadKomentar().then((x) => {
      if (x) this.loading.dismiss();
    });;
  }


  loadCOD() {
    var cod=[];
    firebase.database().ref("user").child(this.item.keyUser).child("ongkir").once("value")
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
              // console.log(key);
              // console.log(childSnapshot.val()[key]);
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
        //console.log(this.cod);
      }

      loadKomentar() {
        return new Promise((resolve) => {
          var arrayKomentar=[];
          firebase.database().ref("komentar").orderByChild("keyDagangan").equalTo(this.item.keyDagangan).once("value")
          .then(function(snapshotKomentar) {
            snapshotKomentar.forEach(function(childSnapshotKomentar) {

          //console.log(childSnapshotKomentar.val());


          firebase.database().ref("user").orderByKey().equalTo(childSnapshotKomentar.val().keyKomentator).once("value")
          .then(function(snapshotUser) {
            var arrayBalasan=[];
            snapshotUser.forEach(function(childSnapshotUser) {
    					//console.log(arrayBalasan);

              if(childSnapshotKomentar.val().balasan==undefined) {
              } else {
                Object.keys(childSnapshotKomentar.val().balasan).forEach(function(key) {
                    //console.log(childSnapshotKomentar.val().balasan[key].keyKomentator);

                    if(childSnapshotKomentar.val().balasan[key].keyKomentator) {
                      firebase.database().ref("user").orderByKey().equalTo(childSnapshotKomentar.val().balasan[key].keyKomentator).once("value")
                      .then(function(snapshot) {
                        snapshot.forEach(function(child) {
                          arrayBalasan.push({
                            keyBalasan        : key,
                            komentatorBalasan : child.val(),
                            isiBalasan        : childSnapshotKomentar.val().balasan[key]
                          });
                        })
                      })
                    }
                  });
              }
              
              arrayKomentar.push({
                keyKomentar: childSnapshotKomentar.key,
                komentator : childSnapshotUser.val(),
                keyKomentator: childSnapshotUser.key,
                komentar: childSnapshotKomentar.val()
                ,balasan: arrayBalasan
              });
              return arrayBalasan;
            });
          });



        })
            resolve(true);
            return[arrayKomentar];
          })
          this.komentar$ = arrayKomentar;
        })
      }

      whatsappShare(item){
        var msg  = "[Daragang] Saya minat dengan "+item.dagang.namaDagangan;
        var oldhp = item.dagang.hp;
        var hp = oldhp.indexOf('0') == 0 ? oldhp.replace("0","+62") : oldhp;
        this.socialSharing.shareViaWhatsAppToReceiver(hp, msg, null, null);
      }

      smsShare(item){
        var msg  = "[Daragang] Saya minat dengan "+item.dagang.namaDagangan;
        var oldhp = item.dagang.hp;
        var hp = oldhp.indexOf('0') == 0 ? oldhp.replace("0","+62") : oldhp;
        this.socialSharing.shareViaSMS(msg,hp);
      }

      penjual(keyUser){
        document.getElementById("map").outerHTML = "";
        this.navCtrl.push("ProfilPage",{keyUser : keyUser});
      }

      @ViewChild('myInput') myInput: ElementRef;

      resize() {
        this.myInput.nativeElement.style.height = this.myInput.nativeElement.scrollHeight + 'px';
      }

      loadingUlasan() {
        this.loading = this.loadingCtrl.create({
          content: 'Mengirim Ulasan'
        });
        this.loading.present();
        this.loadUlasan().then((x) => {
          if (x) this.loading.dismiss();
        });
      }

      loadUlasan() {
        return new Promise((resolve) => {
          var arrayUlasan=[];
          firebase.database().ref("ulasan").orderByChild("keyDagangan").equalTo(this.item.keyDagangan).once("value")
          .then(function(snapshotUlasan) {
            snapshotUlasan.forEach(function(childSnapshotUlasan) {

          //console.log(childSnapshotUlasan.val());


          firebase.database().ref("user").orderByKey().equalTo(childSnapshotUlasan.val().keyPengulas).once("value")
          .then(function(snapshotUser) {
            var arrayBalasan=[];
            snapshotUser.forEach(function(childSnapshotUser) {
              //console.log(arrayBalasan);

              if(childSnapshotUlasan.val().balasan==undefined) {
              } else {
                Object.keys(childSnapshotUlasan.val().balasan).forEach(function(key) {
                    //console.log(childSnapshotUlasan.val().balasan[key].keyPengulas);

                    if(childSnapshotUlasan.val().balasan[key].keyPengulas) {
                      firebase.database().ref("user").orderByKey().equalTo(childSnapshotUlasan.val().balasan[key].keyPengulas).once("value")
                      .then(function(snapshot) {
                        snapshot.forEach(function(child) {
                          arrayBalasan.push({
                            keyBalasan        : key,
                            pengulasBalasan : child.val(),
                            isiBalasan        : childSnapshotUlasan.val().balasan[key]
                          });
                        })
                      })
                    }
                  });
              }
              
              arrayUlasan.push({
                keyUlasan: childSnapshotUlasan.key,
                pengulas : childSnapshotUser.val(),
                keyPengulas: childSnapshotUser.key,
                ulasan: childSnapshotUlasan.val()
                ,balasan: arrayBalasan
              });
              return arrayBalasan;
            });
          });



        })
            resolve(true);
            return[arrayUlasan];
          })
          this.ulasan$ = arrayUlasan;
        })
      }

      kirimKomentar() {
        if(this.currentUser!==null) {
          if(this.currentUser.emailVerified){
            this.komentar.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
            const orderNumber = Math.floor(0-Date.now());
            this.komentar.order = orderNumber;
            this.komentar.keyDagangan = this.item.keyDagangan;
            this.komentar.keyKomentator = this.afAuth.auth.currentUser.uid;
            this.komentar.keyPenjual = this.item.keyUser;

            this.item.dagang.jumlahKomentar = this.item.dagang.jumlahKomentar+1;

            //dicurigai bug
            firebase.database().ref(this.item.dagang.jenis.toLowerCase()).child(this.item.keyUser).child(this.item.keyDagangan).update({
              jumlahKomentar:this.item.dagang.jumlahKomentar
            })

            if(this.komentar.isiKomentar) {

              if(this.currentUser.uid!=this.item.keyUser) {
                this.notifikasi.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
                this.notifikasi.keyPelaku = this.currentUser.uid;
                this.notifikasi.keyPedagang = this.item.keyUser;
                this.notifikasi.keyDagangan = this.item.keyDagangan;
                this.notifikasi.namaDagangan = this.item.dagang.namaDagangan;
                this.notifikasi.fotoDagangan = this.item.dagang.fotoDagangan;
                this.notifikasi.jenisDagangan = this.item.dagang.jenis.toLowerCase();
                this.notifikasi.jenis = "komentar";
                this.notifikasi.aktif = true;
                //this.notifikasi.isi = this.komentar.isiKomentar;

                //nambah notifikasi komentar
                firebase.database().ref("notifikasi").child(this.item.keyUser).child("komentar").push(this.notifikasi);
              }

              firebase.database().ref("komentar").push(this.komentar);
              this.loadingKomentar();
              this.komentar.isiKomentar=null;
            } else {
              alert("Isi Komentar Dulu");
              return;
            }
          } else {
            alert("Anda Harus Verifikasi Email Dulu di Menu Profil Supaya Bisa Memberikan Komentar");
            return;
          }
        } else {
          alert("Anda Harus Login Terlebih Dahulu");
          return;
        }
      }

      kirimBalasan(keyKomentar) {
        this.komentar.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
        const orderNumber = Math.floor(0-Date.now());
        this.komentar.order = orderNumber;
        this.komentar.keyKomentator = this.afAuth.auth.currentUser.uid;
        this.komentar.isiKomentar = this.isiBalasan;
        this.keyKomentarGlobal = keyKomentar;

        if(this.komentar.isiKomentar) {
      		//console.log(this.komentar);
      		firebase.database().ref("komentar").child(keyKomentar).child("balasan").push(this.komentar).then(()=>{

            if(this.currentUser.uid!=this.item.keyUser) {
              this.notifikasi.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
              this.notifikasi.keyPelaku = this.currentUser.uid;
              this.notifikasi.keyPedagang = this.item.keyUser;
              this.notifikasi.keyDagangan = this.item.keyDagangan;
              this.notifikasi.namaDagangan = this.item.dagang.namaDagangan;
              this.notifikasi.fotoDagangan = this.item.dagang.fotoDagangan;
              this.notifikasi.jenisDagangan = this.item.dagang.jenis.toLowerCase();
              this.notifikasi.jenis = "komentar";
              this.notifikasi.aktif = true;
              //this.notifikasi.isi = this.komentar.isiKomentar;

              //nambah notifikasi komentar
              firebase.database().ref("notifikasi").child(this.item.keyUser).child("komentar").push(this.notifikasi);
            }

            this.loadingKomentar();  
            this.isiBalasan=null;
            this.komentar.isiKomentar=null;
          });

      	} else {
      		alert("Isi Komentar Dulu");
      		return;
      	}
      }

balasBalasan(itemBalasan,itemKomentar){
	itemKomentar.komentar.balas = true;
  //console.log(itemKomentar);
  this.isiBalasan="@"+itemBalasan.komentatorBalasan.nama+" : ";
}

balas(itemKomentar){
  itemKomentar.komentar.balas = true;
  //console.log(itemKomentar);
  this.isiBalasan="";
}

copyHp(hp) {
  this.clipboard.copy(hp).then((x) => {
    alert(hp+" telah disalin")
  });
}


showPrompt(item) {
  let prompt = this.alrtCtrl.create({
    title: 'Peringatan',
    message: "Yakin Menghapus Dagangan Ini?",
    buttons: [
    {
      text: 'Batal',
      handler: data => {
        return
      }
    },
    {
      text: 'Hapus',
      handler: data => {
        this.hapus(item);
      }
    }
    ]
  });
  prompt.present();
}

hapus(item) {

  //console.log(item);
  var jenis = item.dagang.jenis;
  var jenisLow = jenis.toLowerCase();
  //console.log(jenisLow);
  firebase.database().ref(jenisLow).child(this.afAuth.auth.currentUser.uid).child(item.keyDagangan).remove().then(()=>{
    firebase.database().ref("komentar").orderByChild("keyDagangan").equalTo(item.keyDagangan).once("value").then(function(snapshotHapus) {
      snapshotHapus.forEach(function(childHapus) {
        //console.log(childHapus.key);
        firebase.database().ref("komentar").child(childHapus.key).remove();

      })
    })
  }).then(()=>{
    this.navCtrl.setRoot("ProfilPage");
    alert("Data Terhapus");  

  })

}

editDagangan(item) {
  this.navCtrl.push("TambahDaganganPage",{item : item, edit : true});
}

imageDownload(myImage){
  const imageViewer = this._imageViewerCtrl.create(myImage);
  imageViewer.present();
}


hapusKomentar(item) {
  let prompt = this.alrtCtrl.create({
    title: 'Peringatan',
    message: "Yakin Menghapus Komentar Ini?",
    buttons: [
    {
      text: 'Batal',
      handler: data => {
        return
      }
    },
    {
      text: 'Hapus',
      handler: data => {
        this.prosesHapusKomentar(item);
      }
    }
    ]
  });
  prompt.present();
}

prosesHapusKomentar(itemHapus) {

  // console.log(item.keyKomentar);
  // console.log(item.komentar.keyPenjual);
  //console.log(itemHapus);
  
  this.item.dagang.jumlahKomentar = this.item.dagang.jumlahKomentar-1;
  firebase.database().ref("komentar").child(itemHapus.keyKomentar).remove().then(()=>{
    firebase.database().ref(this.item.dagang.jenis.toLowerCase()).child(itemHapus.komentar.keyPenjual).child(itemHapus.komentar.keyDagangan).update({
      jumlahKomentar:this.item.dagang.jumlahKomentar
    })
    this.loadKomentar();
    alert("Komentar Terhapus");  
  })  
}

prosesHapusBalasan(itemBalasan,itemKomentar) {
  //dapatkan key komentar induk dan key balasan
  // console.log(itemBalasan.keyBalasan);
  //console.log(itemBalasan);

  firebase.database().ref("komentar").child(itemKomentar.keyKomentar).child("balasan").child(itemBalasan.keyBalasan).remove().then(()=>{
    this.loadKomentar();
    alert("Komentar Terhapus");
  });

}

cekPemilikBalasan(itemBalasan,itemKomentar,i,j) {
  if(this.currentUser!==null) {
    if(this.currentUser.emailVerified){
      if (itemBalasan.isiBalasan.keyKomentator==this.afAuth.auth.currentUser.uid) {
        this.actionSheetBalasanKomentator(itemBalasan,itemKomentar,i,j);
      } else if (this.item.keyUser==this.afAuth.auth.currentUser.uid) {
        this.actionSheetBalasan(itemBalasan,itemKomentar);
      } else {
        this.actionSheetBalasanBukanPemilik(itemBalasan,itemKomentar);
      }
    } else {
      alert("Anda Harus Verifikasi Email Dulu di Menu Profil Supaya Bisa Membalas Komentar");
      return;
    }
  } else {
    alert("Anda Harus Login Terlebih Dahulu");
    return;
  }

}

actionSheetBalasanBukanPemilik(itemBalasan,itemKomentar) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.balasBalasan(itemBalasan,itemKomentar);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

actionSheetBalasan(itemBalasan,itemKomentar) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.balasBalasan(itemBalasan,itemKomentar);

        });
        return false;
      }
    },
    {
      text: 'Hapus',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.prosesHapusBalasan(itemBalasan,itemKomentar);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

actionSheetBalasanKomentator(itemBalasan,itemKomentar,i,j) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.balasBalasan(itemBalasan,itemKomentar);

        });
        return false;
      }
    },
    {
      text: 'Ubah',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.ubahBalasan(itemBalasan,itemKomentar,i,j);

        });
        return false;
      }
    },
    {
      text: 'Hapus',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.prosesHapusBalasan(itemBalasan,itemKomentar);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

ubahBalasan(itemBalasan,itemKomentar,i,j) {
  this.yangIniBalasan[j] = true;
  this.yangIniBalasanParent[i] = true;
  this.isiUbahBalasan[j] = itemBalasan.isiBalasan.isiKomentar;
}

prosesUbahBalasan(editedBalasan,keyKomentar,keyBalasan,i,j){
  if(editedBalasan) {
    firebase.database().ref("komentar").child(keyKomentar).child("balasan").child(keyBalasan).update({
      "isiKomentar":editedBalasan
    }).then(()=>{
      this.loadingKomentar();
      this.isiUbahBalasan[j]=null;
      this.yangIniBalasan[j] = false;
      this.yangIniBalasanParent[i]=false;
    });
  } else {
    alert("Isi Komentar Dulu");
    return;
  }

}

cekPemilikKomentar(itemKomentar,i) {
  if(this.currentUser!==null) {
    if(this.currentUser.emailVerified){
      if (itemKomentar.komentar.keyKomentator==this.afAuth.auth.currentUser.uid) {
        this.actionSheetKomentator(itemKomentar,i);
      } else if (this.item.keyUser==this.afAuth.auth.currentUser.uid) {
        this.actionSheetKomentar(itemKomentar);
      } else {
        this.actionSheetKomentarBukanPemilik(itemKomentar);
      }
    } else {
      alert("Anda Harus Verifikasi Email Dulu di Menu Profil Supaya Bisa Komentar");
      return;
    }
  } else {
    alert("Anda Harus Login Terlebih Dahulu");
    return;
  }

}

actionSheetKomentarBukanPemilik(itemKomentar) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.balas(itemKomentar);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

actionSheetKomentar(itemKomentar) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.balas(itemKomentar);

        });
        return false;
      }
    },
    {
      text: 'Hapus',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.hapusKomentar(itemKomentar);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

actionSheetKomentator(itemKomentar,i) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.balas(itemKomentar);

        });
        return false;
      }
    },
    {
      text: 'Ubah',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.ubahKomentar(itemKomentar,i);

        });
        return false;
      }
    },
    {
      text: 'Hapus',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.hapusKomentar(itemKomentar);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

ubahKomentar(itemKomentar,i) {
  this.yangIni[i]=true;
  this.isiUbahKomentar[i] = itemKomentar.komentar.isiKomentar;
}

prosesUbahKomentar(editedKomentar,keyKomentar,i){
  if(editedKomentar) {
    firebase.database().ref("komentar").child(keyKomentar).update({
      "isiKomentar":editedKomentar
    }) .then(()=>{
      this.loadingKomentar();
      this.isiUbahKomentar[i]=null;
      this.yangIni[i]=false;
    });
  } else {
    alert("Isi Komentar Dulu");
    return;
  }

}



//MODUL ULASAN START 
cekPemilikUlasanBalasan(itemUlasan,itemBalasan,i) {
  if(this.currentUser!==null) {
    if(this.currentUser.emailVerified){
      if (itemBalasan.isiBalasan.keyPengulas==this.afAuth.auth.currentUser.uid) {
        this.actionSheetUlasanBalasanPengulas(itemUlasan,itemBalasan,i);
      } else {
        this.actionSheetUlasanHanyaBalas(itemUlasan);
      }
    } else {
      alert("Anda Harus Verifikasi Email di Menu Profil Supaya Bisa Membalas Ulasan");
      return;
    }
  } else {
    alert("Anda Harus Login Terlebih Dahulu");
    return;
  }

}

actionSheetUlasanBalasanPengulas(itemUlasan,itemBalasan,i) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {
          this.balasUlasan(itemUlasan);

        });
        return false;
      }
    },
    {
      text: 'Ubah',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.ubahUlasan(itemUlasan,i);

        });
        return false;
      }
    },
    {
      text: 'Hapus',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.showPromptHapusUlasanBalasan(itemUlasan,itemBalasan,i);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

showPromptHapusUlasanBalasan(itemUlasan,itemBalasan,i) {
  let prompt = this.alrtCtrl.create({
    title: 'Peringatan',
    message: "Yakin Menghapus Ulasan Ini?",
    buttons: [
    {
      text: 'Batal',
      handler: data => {
        return
      }
    },
    {
      text: 'Hapus',
      handler: data => {
        this.hapusUlasanBalasan(itemUlasan,itemBalasan,i);
      }
    }
    ]
  });
  prompt.present();
}

hapusUlasanBalasan(itemUlasan,itemBalasan,i) {
  firebase.database().ref("ulasan").child(itemUlasan.keyUlasan).child("balasan").child(itemBalasan.keyBalasan).remove().then(()=>{
    this.loadingUlasan();
    alert("Ulasan Terhapus");
  });

}


cekPemilikUlasan(itemUlasan,i) {
  if(this.currentUser!==null) {
    if(this.currentUser.emailVerified){
      if (itemUlasan.ulasan.keyPengulas==this.afAuth.auth.currentUser.uid) {
        this.actionSheetUlasanPengulas(itemUlasan,i);
      } else {
        this.actionSheetUlasanHanyaBalas(itemUlasan);
      }
    } else {
      alert("Anda Harus Verifikasi Email Dulu di Menu Profil Supaya Bisa Membalas Ulasan");
      return;
    }
  } else {
    alert("Anda Harus Login Terlebih Dahulu");
    return;
  }

}

kirimUlasan() {
  if(this.currentUser!==null) {
    if(this.currentUser.emailVerified){
      return new Promise((resolve) => {
        var pengulas = Object();
        firebase.database().ref("ulasan").orderByChild("keyDagangan").equalTo(this.item.keyDagangan).once("value")
        .then(function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            pengulas.key = childSnapshot.val().keyPengulas;
          })
          return pengulas;
          
        }).then((x)=>{

          if(x.key==this.currentUser.uid) {
            alert("Maaf, Hanya Bisa Mengirim Ulasan Sekali Tiap Dagangan");
            return;
          } else {

            this.ulasan.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
            const orderNumber = Math.floor(0-Date.now());
            this.ulasan.order = orderNumber;
            this.ulasan.keyDagangan = this.item.keyDagangan;
            this.ulasan.keyPengulas = this.afAuth.auth.currentUser.uid;
            this.ulasan.keyPenjual = this.item.keyUser;

            if(this.ulasan.keyPengulas == this.ulasan.keyPenjual) {
              alert("Tidak Bisa Mengulas Dagangan Sendiri");
              return;

            } else {
              if(this.ulasan.isiUlasan) {
                if (this.selectedPhoto||this.captureDataUrl) {
                  if(this.ulasan.rating) {
                              this.notifikasi.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
                              this.notifikasi.keyPelaku = this.currentUser.uid;
                              this.notifikasi.keyPedagang = this.item.keyUser;
                              this.notifikasi.keyDagangan = this.item.keyDagangan;
                              this.notifikasi.namaDagangan = this.item.dagang.namaDagangan;
                              this.notifikasi.fotoDagangan = this.item.dagang.fotoDagangan;
                              this.notifikasi.jenisDagangan = this.item.dagang.jenis.toLowerCase();
                              this.notifikasi.jenis = "ulasan";
                              this.notifikasi.aktif = true;

                              //nambah notifikasi ulasan
                              firebase.database().ref("notifikasi").child(this.item.keyUser).child("ulasan").push(this.notifikasi);
                      
                              //console.log(this.ulasan);
                              firebase.database().ref("ulasan").push(this.ulasan).then(ulasan => {
                                const idUlasan = ulasan.key;
                                this.imageName = idUlasan;
                                if(this.selectedPhoto) {
                                  this.uploadCamera().then(()=>{
                                    resolve(true);
                                  });
                                }
                                if(this.captureDataUrl) {
                                  this.uploadGallery().then(()=>{
                                    resolve(true);
                                  });
                                }
                              })
                            } else {
                              alert("Ulasan Wajib Memberikan Rating / Bintang Kepuasan")
                            }

                          } else {
                            alert("Ulasan Wajib Melampirkan Foto Dagangan yang Dibeli");
                            return;
                          }
                        } else {
                          alert("Isi Ulasan Dulu");
                          return;
                        }

                      }
                    }
                  })
      }).then(()=>{
        this.ulasan.isiUlasan=null;
        this.currentImage=null;
        this.ulasan.rating=0;
        this.loadUlasan()
      })
      
    } else {
      alert("Anda Harus Verifikasi Email Dulu di Menu Profil Supaya Bisa Kirim Ulasan");
      return;
    }
  } else {
    alert("Anda Harus Login Terlebih Dahulu");
    return;
  }
}


actionSheetUlasanHanyaBalas(itemUlasan) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.balasUlasan(itemUlasan);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

actionSheetUlasanPengulas(itemUlasan,i) {
  const actionSheet = this.actionSheetCtrl.create({
    buttons: [
    {
      text: 'Balas',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {
          this.balasUlasan(itemUlasan);

        });
        return false;
      }
    },
    {
      text: 'Ubah',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.ubahUlasan(itemUlasan,i);

        });
        return false;
      }
    },
    {
      text: 'Hapus',
      handler: () => {
        const navTransition = actionSheet.dismiss();
        navTransition.then(() => {

          this.showPromptHapusUlasan(itemUlasan);

        });
        return false;
      }
    }
    ]
  });
  actionSheet.present();
}

showPromptHapusUlasan(itemUlasan) {
  let prompt = this.alrtCtrl.create({
    title: 'Peringatan',
    message: "Yakin Menghapus Ulasan Ini?",
    buttons: [
    {
      text: 'Batal',
      handler: data => {
        return
      }
    },
    {
      text: 'Hapus',
      handler: data => {
        this.hapusUlasan(itemUlasan);
      }
    }
    ]
  });
  prompt.present();
}

balasUlasan(itemUlasan){
  itemUlasan.ulasan.balas = true;
  //console.log(itemUlasan);
  this.isiBalasan="";
}

kirimBalasanUlasan(keyUlasan) {
  if(this.currentUser!==null) {
    if(this.currentUser.emailVerified){
      this.ulasan.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
      const orderNumber = Math.floor(0-Date.now());
      this.ulasan.order = orderNumber;
      this.ulasan.keyPengulas = this.afAuth.auth.currentUser.uid;
      this.ulasan.isiUlasan = this.isiBalasanUlasan;
      //this.keyUlasanGlobal = keyUlasan;

      if(this.ulasan.isiUlasan) {
      //console.log(this.ulasan);
      firebase.database().ref("ulasan").child(keyUlasan).child("balasan").push(this.ulasan).then(()=>{
        this.loadingUlasan();  
        this.isiBalasanUlasan=null;
        this.ulasan.isiUlasan=null;
      });
    } else {
      alert("Isi Ulasan Dulu");
      return;
    }
  } else {
    alert("Anda Harus Verifikasi Email Dulu di Menu Profil Supaya Bisa Balas Ulasan");
    return;
  }
} else {
  alert("Anda Harus Login Dulu");
  return;
}
}

ubahUlasan(itemUlasan,i) {
  this.yangIniUlasan[i] = true;
  this.isiRatingUlasan[i] = itemUlasan.ulasan.rating;
  this.isiUbahUlasan[i] = itemUlasan.ulasan.isiUlasan;
  this.currentUbahImage[i] = itemUlasan.ulasan.foto;

}

prosesUbahUlasan(isiUlasan,itemUlasan,i) {
  if(isiUlasan) {
    return new Promise((resolve) => {
    this.imageName = itemUlasan.keyUlasan;
    if(this.selectedPhoto) {
      this.uploadCamera().then(()=>
        resolve(true));
    } else 
    if(this.captureDataUrl) {
      this.uploadGallery().then(()=>
        resolve(true));
    } else {
      resolve(true);
    }
  }).then(()=>{
    firebase.database().ref("ulasan").child(itemUlasan.keyUlasan).update({
      "isiUlasan":isiUlasan,
      "rating":this.isiRatingUlasan[i],
      "foto":this.currentUbahImage[i]
    }).then(()=>{
      this.loadingUlasan();
      this.isiRatingUlasan[i] = null;
      this.isiUbahUlasan[i] = null;
      this.currentUbahImage[i] = null;
      this.yangIniUlasan[i] = false;
    })
    });
  } else {
    alert("Isi Komentar Dulu");
    return;
  }
}

hapusUlasan(itemUlasan) {
  var imageName = itemUlasan.keyUlasan+".jpg";
  firebase.database().ref("ulasan").child(itemUlasan.keyUlasan).remove().then(()=>{
    firebase.storage().ref("ulasan").child(itemUlasan.ulasan.keyPenjual).child(itemUlasan.ulasan.keyDagangan)
    .child(imageName).delete().then(()=>{
      this.loadingUlasan();
    })
  })

}

uploadFotoUlasan(): void {
  if(this.currentUser!==null) {
    if(this.currentUser.emailVerified){
      let actionSheet = this.actionSheetCtrl.create({
        enableBackdropDismiss: true,
        buttons: [
        {
          text: 'Take a picture',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'From gallery',
          icon: 'images',
          handler: () => {
            this.takeGallery();
          }
        }
        ]
      });
      actionSheet.present();
    } else {
      alert("Anda Harus Verifikasi Email Dulu di Menu Profil Supaya Bisa Kirim Ulasan");
      return;
    }
  } else {
    alert("Anda Harus Login Dulu");
    return;
  }
}

uploadFotoUbahUlasan(i): void {
  let actionSheet = this.actionSheetCtrl.create({
    enableBackdropDismiss: true,
    buttons: [
    {
      text: 'Take a picture',
      icon: 'camera',
      handler: () => {
        this.takePhotoUbah(i);
      }
    },
    {
      text: 'From gallery',
      icon: 'images',
      handler: () => {
        this.takeGalleryUbah(i);
      }
    }
    ]
  });
  actionSheet.present();
}

takePhotoUbah(i){
  const options : CameraOptions = {
    allowEdit:true,
    quality:75,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType:this.camera.MediaType.PICTURE,
    correctOrientation: true
  }

  this.camera.getPicture(options).then((ImageData)=>{
    this.loading = this.loadingCtrl.create({
      content: 'Mengambil Foto'
    });

    this.loading.present();
    this.selectedPhoto = this.dataURLtoBlob('data:image/jpeg;base64,'+ImageData);
    this.loading.dismiss();
    this.currentUbahImage[i] = 'data:image/jpeg;base64,'+ImageData;
  },(err)=>{
    console.log(err);
  }) ;
}

takePhoto(){
  const options : CameraOptions = {
    allowEdit:true,
    quality:75,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType:this.camera.MediaType.PICTURE,
    correctOrientation: true
  }

  this.camera.getPicture(options).then((ImageData)=>{
    this.loading = this.loadingCtrl.create({
      content: 'Mengambil Foto'
    });

    this.loading.present();
    this.selectedPhoto = this.dataURLtoBlob('data:image/jpeg;base64,'+ImageData);
    this.loading.dismiss();
    this.currentImage = 'data:image/jpeg;base64,'+ImageData;
  },(err)=>{
    console.log(err);
  }) ;
}

dataURLtoBlob(dataURL){
  let binary = atob(dataURL.split(',')[1]);
  let array = [];
  for (let index = 0; index < binary.length; index++) {
    array.push(binary.charCodeAt(index));

  }
  return new Blob([new Uint8Array(array)],{type:'image/jpeg'});
}

takeGallery(){
  const galleryOptions : CameraOptions = {
    allowEdit: true,
    quality: 75,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: 0,
    correctOrientation: true
  }

  this.camera.getPicture(galleryOptions)
  .then((captureDataUrl) => {
    this.captureDataUrl = 'data:image/jpeg;base64,' + captureDataUrl;
    this.currentImage = this.captureDataUrl;
  }, (err) => {
    console.log(err);
  });
}

takeGalleryUbah(i){
  const galleryOptions : CameraOptions = {
    allowEdit: true,
    quality: 75,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: 0,
    correctOrientation: true
  }

  this.camera.getPicture(galleryOptions)
  .then((captureDataUrl) => {
    this.captureDataUrl = 'data:image/jpeg;base64,' + captureDataUrl;
    this.currentUbahImage[i] = this.captureDataUrl;
  }, (err) => {
    console.log(err);
  });
}    

uploadGallery() {
  return new Promise((resolve) => {
    this.loading = this.loadingCtrl.create({
      content: 'Mengunggah Foto'
    });
    this.loading.present();
    let storageRef = firebase.storage().ref();
    // Create a timestamp as filename
    //imagename = id ulasan
    const filename = this.imageName;

    //this.item.keyUser/penjual this.item.keyDagangan idulasan
    const imageRef = storageRef.child('ulasan').child(this.item.keyUser+'/'+this.item.keyDagangan+'/'+filename+'.jpg');

    var persen = 0;
    imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL)
    .then((snapshot)=> {
      persen = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      if (persen==100) {
        this.ulasan.foto = snapshot.downloadURL;
              // Do something here when the data is succesfully uploaded!
              firebase.database().ref('ulasan/'+this.imageName).update({
                "foto": this.ulasan.foto
              }).then(()=>{
                resolve(true);       
              });
            }
          });
  }).then(() => {
    this.loading.dismiss();
  })
}

uploadCamera(){
  return new Promise((resolve) => {
    if(this.selectedPhoto){
      this.loading = this.loadingCtrl.create({
        content: 'Mengunggah Foto'
      });
      this.loading.present();

      var persen = 0;
      var uploadTask =  firebase.storage().ref().child('ulasan').child(this.item.keyUser+'/'+this.item.keyDagangan+'/'+this.imageName+'.jpg');
      uploadTask.put(this.selectedPhoto)
      .then(savePic=> {
        persen = (savePic.bytesTransferred / savePic.totalBytes) * 100;
        if (persen==100) {
          this.ulasan.foto = savePic.downloadURL;
          firebase.database().ref('ulasan/'+this.imageName).update({
            "foto": this.ulasan.foto
          }).then(()=>{
            resolve(true);       
          })
        }
      });
    }
  }).then(() => {
    this.loading.dismiss();
  })
}

likerUid;
like(item) {
  if(this.afAuth.auth.currentUser==null) {
      alert("Harus Login Dulu Supaya Bisa Menyukai");
      return;
  } else {
    this.likerUid = firebase.auth().currentUser.uid;

    var querySudahLike  = firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan);
    querySudahLike.once("value", snapshot => {

      const userData = snapshot.val();
      var jenis = item.dagang.jenis.toLowerCase();

      if (userData){
        firebase.database().ref(jenis).child(item.keyUser).child(item.keyDagangan).child("liker").child(this.likerUid).remove();
        
        //hapus like di user
        firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan).remove();

        item.jumlahLike = item.jumlahLike-1;
        //this.buttonColor = "primary";
        item.disukai.suka = !item.disukai.suka;
        this.toastCtrl.create({
          message: `${item.dagang.namaDagangan}, batal disukai`,
          duration: 3000,position: 'top'
        }).present();      
        
      } else {
        //nambah Liker di dagangan
        firebase.database().ref(jenis).child(item.keyUser).child(item.keyDagangan).child("liker").child(this.likerUid).set("true");
        
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

roundUp(num, precision) {
  precision = Math.pow(10, precision)
  return Math.ceil(num * precision) / precision
}

doRefresh(refresher: Refresher) {
  this.ionViewDidLoad();


      // simulate a network request that would take longer
      // than just pulling from out local json file
      setTimeout(() => {
        refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Telah Dimuat Ulang',
          duration: 3000
        });
        toast.present();

      }, 1000);

    }

  }
