import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, PopoverController, Refresher, ToastController,
AlertController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import { size } from "lodash";
import { NotifikasiComponent } from '../../components/notifikasi/notifikasi';
import { MyApp } from '../../app/app.component';



@IonicPage()
@Component({
  selector: 'page-notifikasi',
  templateUrl: 'notifikasi.html',
})
export class NotifikasiPage {
	notifikasi: string = "suka";
  userUid;
  notifikasi$: Array<any>;
  notifikasiKomentar$: Array<any>;
  notifikasiUlasan$: Array<any>;
  jumlah=Object();
  dibaca=false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public plt: Platform, public popoverCtrl: PopoverController,
    private toastCtrl: ToastController, private alrtCtrl : AlertController, public myApp: MyApp ) {
  	plt.registerBackButtonAction(() => {
   		this.navCtrl.setRoot('TabsPage');
	});
    this.userUid = firebase.auth().currentUser.uid;
    this.jumlah.like=0;
    this.jumlah.komentar=0;
    this.jumlah.ulasan=0;
  }

  ionViewWillLeave() {

  }

  actionNotif(myEvent) {
    let popover = this.popoverCtrl.create(NotifikasiComponent);
    popover.present({
      ev: myEvent
    });

    popover.onDidDismiss((baca) => {
      if(baca=="baca") {
        firebase.database().ref("notifikasi").child(this.userUid).child("like").orderByChild("aktif").equalTo(true)
        .once("value").then(function(snapshot){
          snapshot.forEach(function(childSnapshot) {
            firebase.database().ref("notifikasi").child(firebase.auth().currentUser.uid).child("like")
            .child(childSnapshot.key).child("aktif").set(false);
          })
        });
        firebase.database().ref("notifikasi").child(this.userUid).child("komentar").orderByChild("aktif").equalTo(true)
        .once("value").then(function(snapshot){
          snapshot.forEach(function(childSnapshot) {
            firebase.database().ref("notifikasi").child(firebase.auth().currentUser.uid).child("komentar")
            .child(childSnapshot.key).child("aktif").set(false);
          })
        })
        firebase.database().ref("notifikasi").child(this.userUid).child("ulasan").orderByChild("aktif").equalTo(true)
        .once("value").then(function(snapshot){
          snapshot.forEach(function(childSnapshot) {
            firebase.database().ref("notifikasi").child(firebase.auth().currentUser.uid).child("ulasan")
            .child(childSnapshot.key).child("aktif").set(false);
          })
        })
        this.jumlah.like = 0;
        this.jumlah.komentar = 0;
        this.jumlah.ulasan = 0;
        this.dibaca = true;
      } else if(baca=="hapus") {
        this.showPrompt();
      } else {
        return;
      }
    })
  }

  showPrompt() {
    let prompt = this.alrtCtrl.create({
      title: 'Peringatan',
      message: "Yakin Menghapus Semua Notifikasi?",
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
          firebase.database().ref("notifikasi").child(this.userUid).remove().then(()=>{
            this.ionViewDidLoad();
          })
        }
      }
      ]
    });
    prompt.present();
  }

  klikNotifLike(item) {
    firebase.database().ref("notifikasi").child(item.notif.keyPedagang).child("like").child(item.keyNotif).child("aktif").set(false);
    item.notif.aktif = false;
    this.jumlah.like = this.jumlah.like-1;
  }

  klikNotifKomentar(item) {
    firebase.database().ref("notifikasi").child(item.notif.keyPedagang).child("komentar").child(item.keyNotif).child("aktif").set(false);
    item.notif.aktif = false;
    this.jumlah.komentar = this.jumlah.komentar-1;
  }

  klikNotifUlasan(item) {
    firebase.database().ref("notifikasi").child(item.notif.keyPedagang).child("ulasan").child(item.keyNotif).child("aktif").set(false);
    item.notif.aktif = false;
    this.jumlah.ulasan = this.jumlah.ulasan-1;
  }

  ionViewDidLoad() {
    var arrayNotifikasiLike=[];
    var arrayNotifikasiKomentar=[];
    var arrayNotifikasiUlasan=[];
    var jumlah=Object();
    jumlah.like=0;
    jumlah.komentar=0;
    jumlah.ulasan=0;

    firebase.database().ref("notifikasi").child(this.userUid).once("value").then(function(snapshop){

      snapshop.forEach(function(childSnapshot){

        Object.keys(childSnapshot.val()).forEach(function(key) {

          firebase.database().ref("user").child(childSnapshot.val()[key].keyPelaku).once("value").then(function(snapshopUser){
            //console.log(snapshopUser.val());
            var namaPelaku = snapshopUser.val().nama;
            var fotoPelaku = snapshopUser.val().foto;

            if(childSnapshot.key=="like") {

              if(childSnapshot.val()[key].aktif) {
                jumlah.like = jumlah.like+1;  
              }

              arrayNotifikasiLike.push({
                keyNotif : key,
                namaPelaku: namaPelaku,
                fotoPelaku: fotoPelaku,
                notif: childSnapshot.val()[key]
              });


            } else if (childSnapshot.key=="komentar") {

              if(childSnapshot.val()[key].aktif) {
                jumlah.komentar = jumlah.komentar+1;  
              }

              arrayNotifikasiKomentar.push({
                keyNotif : key,
                namaPelaku: namaPelaku,
                fotoPelaku: fotoPelaku,
                notif: childSnapshot.val()[key]
              });

            } else if (childSnapshot.key=="ulasan") {

              if(childSnapshot.val()[key].aktif) {
                jumlah.ulasan = jumlah.ulasan+1;  
              }

              arrayNotifikasiUlasan.push({
                keyNotif : key,
                namaPelaku: namaPelaku,
                fotoPelaku: fotoPelaku,
                notif: childSnapshot.val()[key]
              });
            }

          })
        })
      })
        return [arrayNotifikasiLike,jumlah,arrayNotifikasiKomentar,arrayNotifikasiUlasan];
    })
    this.notifikasi$ = arrayNotifikasiLike;
    this.notifikasiKomentar$ = arrayNotifikasiKomentar;
    this.notifikasiUlasan$ = arrayNotifikasiUlasan;
    this.jumlah = jumlah;
    
  }

  klikNotifikasi(notif) {
    var dagangan;
    var item=[];
    return new Promise((resolve) => {
    firebase.database().ref(notif.jenisDagangan).child(notif.keyPedagang).child(notif.keyDagangan).once("value").then(function(snapshop){
      dagangan = snapshop.val();

      var jumlahUlasan=0;
      var rate = 0;
      var ulas=Object();
      firebase.database().ref("ulasan").orderByChild("keyDagangan").equalTo(notif.keyDagangan).once("value")
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

          var precision = Math.pow(10, 1);
          ulas.rate = Math.ceil(ulas.rate * precision) / precision;
          
          ulas.jumlah = jumlahUlasan;  
        }
      }).then(()=>{
        //cek ongkir
        var cod=[];
        var ongkir=Object();
        firebase.database().ref("user").child(notif.keyPedagang).child("ongkir").once("value")
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
        if(dagangan.liker) {
          Object.keys(dagangan.liker).forEach(function(key) {
            if(firebase.auth().currentUser==null) {
              disukai.suka=false;
            } else {
              if(key==firebase.auth().currentUser.uid) {
                disukai.suka=true;
              }
            }
          })
        }
        var jumlahLike = size(dagangan.liker);

        item.push({
          keyUser: notif.keyPedagang,
          keyDagangan: notif.keyDagangan,
          dagang: dagangan,
          ulasan: ulas,
          jumlahLike: jumlahLike,
          disukai:disukai,
          ongkir: ongkir
        })
        resolve (item[0]);
      })
      
    })
  }).then((x)=>{
    this.navCtrl.push("DetailPage", {item:x});
  })
  }

  klikPelaku(key) {
    this.navCtrl.push("ProfilPage", {keyUser:key})
  }

  doRefresh(refresher: Refresher) {
  this.ionViewDidLoad();

      setTimeout(() => {
        refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Telah Dimuat Ulang',
          duration: 3000
        });
        toast.present();

      }, 1000);

  }

  hitungNotif(){
    this.myApp.hitungNotif(this.userUid);
  }

}
