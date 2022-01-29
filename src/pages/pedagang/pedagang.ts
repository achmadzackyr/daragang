import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, ToastController, Refresher, LoadingController, Platform } from 'ionic-angular';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { size } from "lodash";
import { FilterService } from '../../providers/filter';
import { FilterPedagangComponent } from '../../components/filter-pedagang/filter-pedagang';

import * as moment from 'moment';
import { Ikuti } from '../../models/ikuti';

@IonicPage()
@Component({
  selector: 'page-pedagang',
  templateUrl: 'pedagang.html',
})
export class PedagangPage {
	public pedagangList:Array<any>;
	pedagang$:Array<any>;
	infitnite=[];
	filteredItems;

  ikuti = {} as Ikuti;
  diikuti;
  uid:any;
  loading;
  jumlah=Object();


  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController,
    public popoverCtrl: PopoverController, public filterCtrl : FilterService, public afAuth: AngularFireAuth, 
    public toastCtrl: ToastController, public plt: Platform) {

    this.jumlah.like=0;
    this.jumlah.komentar=0;
    this.jumlah.ulasan=0;

  	for (let i = 0; i < 1; i++) {
      this.infitnite.push( this.infitnite.length );
    }

    plt.registerBackButtonAction(() => {
       this.navCtrl.setRoot('TabsPage');
    });
  }

  ionViewDidLoad() {
    if(this.afAuth.auth.currentUser==null) {
      alert("Anda Harus Login Terlebih Dahulu");
      this.navCtrl.setRoot("LoginPage");
      return;
    } else {
      this.hitungNotif();
      this.loadPedagang().then(()=> {
        this.filterCtrl.pedagang$ = this.pedagang$;
        this.filterCtrl.pedagangList = this.pedagangList;
        //this.cekIkuti();
      });
    }
  }

  initializeItems(){
    this.pedagang$ = this.pedagangList;
    this.filterCtrl.initializeItemsPenjual();
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create(FilterPedagangComponent);

    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss((data,kab) => {
            //console.log(data);
            if (data!=null) {
              this.initializeItems();
              this.filteredItems = data;
              if(this.filteredItems.ciamis) {
                this.filterCtrl.cariBerdasarCiamisPenjual(this.filteredItems.ciamis);
                this.pedagang$ = this.filterCtrl.pedagang$;
              } else if(this.filteredItems.banjar) {
                this.filterCtrl.cariBerdasarBanjarPenjual(this.filteredItems.banjar);
                this.pedagang$ = this.filterCtrl.pedagang$;
              } else if(this.filteredItems.pangandaran) {
                this.filterCtrl.cariBerdasarPangandaranPenjual(this.filteredItems.pangandaran);
                this.pedagang$ = this.filterCtrl.pedagang$;
              } else if(this.filteredItems.kotatasikmalaya) {
                this.filterCtrl.cariBerdasarKotatasikmalayaPenjual(this.filteredItems.kotatasikmalaya);
                this.pedagang$ = this.filterCtrl.pedagang$;
              } else if(this.filteredItems.kabtasikmalaya) {
                this.filterCtrl.cariBerdasarKabtasikmalayaPenjual(this.filteredItems.kabtasikmalaya);
                this.pedagang$ = this.filterCtrl.pedagang$;
              } else if(this.filteredItems.garut) {
                this.filterCtrl.cariBerdasarGarutPenjual(this.filteredItems.garut);
                this.pedagang$ = this.filterCtrl.pedagang$;
              } else if(this.filteredItems.sumedang) {
                this.filterCtrl.cariBerdasarSumedangPenjual(this.filteredItems.sumedang);
                this.pedagang$ = this.filterCtrl.pedagang$;
              } else if(kab!="backdrop") {
                this.filterCtrl.cariBerdasarKabupatenCODPenjual(kab);
                this.pedagang$ = this.filterCtrl.pedagang$;
              }

              if(this.filteredItems.kecamatan) {
                this.filterCtrl.cariBerdasarKecamatanPenjual(this.filteredItems.kecamatan);
                this.pedagang$ = this.filterCtrl.pedagang$;

              } else if (this.filteredItems.kabupaten) {
                this.filterCtrl.cariBerdasarKabupatenPenjual(this.filteredItems.kabupaten);
                this.pedagang$ = this.filterCtrl.pedagang$;

              } else if (this.filteredItems=="reset") {
                this.initializeItems();
              }
            } 
            else {
              return;
            }

          });
  }

  presentLoadingDefault() {

    this.loading = this.loadingCtrl.create({
      content: 'Akun yang Punya Dagangan'
    });

    this.loading.present();

    setTimeout(() => {
      this.loading.dismiss();
    }, 7500);
  }

  loadPedagang() {
  	return new Promise((resolve) => {
      this.presentLoadingDefault();
      var arrayPedagang=[];
      var currentUser = this.afAuth.auth.currentUser.uid;
    //var following = false;

    firebase.database().ref("user").orderByKey().once("value")
    .then(function(snapshot) {
    	snapshot.forEach(function(childSnapshot) {

        var jumlahUlasan=0;
        var rate = 0;
        var ulas=Object();
        firebase.database().ref("ulasan").orderByChild("keyPenjual").equalTo(childSnapshot.key)
        .once("value")
        .then(function(snapshotUlasan) {
          jumlahUlasan = size(snapshotUlasan.val());

          snapshotUlasan.forEach(function(childSnapshotUlasan) {
            rate = childSnapshotUlasan.val().rating+rate; 
          })
          return [rate,jumlahUlasan];
        }).then(()=>{
          if (rate==0&&jumlahUlasan==0) {
            ulas.rate = rate;
            ulas.jumlah = jumlahUlasan;  
          } else {
            ulas.rate = rate/jumlahUlasan;

            var precision = Math.pow(10, 1);
            ulas.rate = Math.ceil(ulas.rate * precision) / precision;

            ulas.jumlah = jumlahUlasan;  
          }

          var diikuti=[];     
          var tod;
          firebase.database().ref("mengikuti").child(currentUser).child(childSnapshot.key)
          .once("value")
          .then(function(cekIkuti){
            diikuti.push(cekIkuti.val());

            return diikuti;
          }).then(()=>{
            tod = diikuti[0];
            //console.log(tod);



            var jumlahMakanan=[];
            var jumlahBarang=[];
            var jumlahJasa=[];
            var jumlahDagangan=0;
            firebase.database().ref("makanan").child(childSnapshot.key).once("value")
            .then(function(snapshopDagangan){
              jumlahMakanan.push(size(snapshopDagangan.val()));
              return jumlahMakanan;
            }).then(()=>{
              firebase.database().ref("barang").child(childSnapshot.key).once("value")
              .then(function(snapshopDagangan){
                jumlahBarang.push(size(snapshopDagangan.val()));
                return jumlahBarang;
              }).then(()=>{

                firebase.database().ref("jasa").child(childSnapshot.key).once("value")
                .then(function(snapshopDagangan){
                  jumlahJasa.push(size(snapshopDagangan.val()));
                  return jumlahJasa;
                }).then(()=>{
                  jumlahDagangan=jumlahMakanan[0]+jumlahBarang[0]+jumlahJasa[0];
                  
                  if(jumlahDagangan!=0) {
                    arrayPedagang.push({
                      keyUser : childSnapshot.key,
                      dataUser : childSnapshot.val(),
                      ulasan : ulas,
                      following: tod
                    });
                    var m = arrayPedagang.length, t, i;

                    // While there remain elements to shuffle…
                    while (m) {

                      // Pick a remaining element…
                      i = Math.floor(Math.random() * m--);

                      // And swap it with the current element.
                      t = arrayPedagang[m];
                      arrayPedagang[m] = arrayPedagang[i];
                      arrayPedagang[i] = t;
                    }
              }
            })

              })
            })
          })
        })


      })
    	resolve(true);
    	return arrayPedagang;
    })
    this.pedagang$ = arrayPedagang;
    this.pedagangList = arrayPedagang;    	
  }).then((x)=>{
    if(x)
    this.loading.dismiss();
  })
  }

  slice: number = 5;
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.slice += 5;
      infiniteScroll.complete();
    }, 200);
  }

  penjual(keyUser){
    this.navCtrl.push("ProfilPage",{keyUser : keyUser});
  }

  getItems(searchbar) {
    this.filterCtrl.getItemsPenjual(searchbar);
    this.pedagang$ = this.filterCtrl.pedagang$;
  }

  jadiPengikut(item) {
    item.following = !item.following;
    this.ikuti.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
    const orderNumber = Math.floor(0-Date.now());
    this.ikuti.order = orderNumber;

    firebase.database().ref("mengikuti").child(this.afAuth.auth.currentUser.uid).child(item.keyUser).set("true").then(()=>{
      firebase.database().ref("diikuti").child(item.keyUser).child(this.afAuth.auth.currentUser.uid).set("true").then(()=>{
        this.toastCtrl.create({
          message: `Anda Telah Mengikuti ${item.dataUser.nama}`,
          duration: 3000,position: 'top'
        }).present();
      })
    });
  }

  batalIkut(item) {
    item.following = !item.following;
    this.ikuti.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
    const orderNumber = Math.floor(0-Date.now());
    this.ikuti.order = orderNumber;
    this.ikuti.keyDiikuti = this.uid;
    this.ikuti.keyPengikut = this.afAuth.auth.currentUser.uid;

    firebase.database().ref("mengikuti").child(this.afAuth.auth.currentUser.uid).child(item.keyUser).remove().then(()=>{
      firebase.database().ref("diikuti").child(item.keyUser).child(this.afAuth.auth.currentUser.uid).remove().then(()=>{
        this.toastCtrl.create({
          message: `Anda Batal Mengikuti ${item.dataUser.nama}`,
          duration: 3000,position: 'top'
        }).present();
      })
    });
  }

  doRefresh(refresher: Refresher) {
    this.loadPedagang().then(()=> {
      //this.pedagang$ = this.pedagangList;
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
    });
  }

hitungNotif() {
    var jumlah=Object();
    jumlah.like=0;
    jumlah.komentar=0;
    jumlah.ulasan=0;

    firebase.database().ref("notifikasi").child(this.afAuth.auth.currentUser.uid).once("value").then(function(snapshop){

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
