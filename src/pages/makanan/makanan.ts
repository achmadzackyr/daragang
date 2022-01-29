import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content , Platform,
 ToastController, LoadingController, PopoverController, Refresher } from 'ionic-angular';
import { FilterService } from '../../providers/filter';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { size } from "lodash";
import { FilterComponent } from '../../components/filter/filter';
import * as moment from 'moment';
import { Notifikasi } from '../../models/notifikasi';

@IonicPage()
@Component({
  selector: 'page-makanan',
  templateUrl: 'makanan.html',
})
export class MakananPage {
  @ViewChild(Content) content: Content;
  public makananList:Array<any>;
  public kat: string;
  notifikasi = {} as Notifikasi;

  following = false;
  loading;
  makanan$: Array<any>;
  kosong=null;
  infitnite=[];
  rating;
  jumlahUlasan;
  filteredItems;
  DECIMAL_SEPARATOR=",";
  GROUP_SEPARATOR=".";
  pilih=false;
  jumlah=Object();
 
  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public toastCtrl: ToastController,
    public navParams: NavParams, public popoverCtrl: PopoverController, public filterCtrl : FilterService, 
    public afAuth: AngularFireAuth, public plt: Platform) {
      this.jumlah.like=0;
      this.jumlah.komentar=0;
      this.jumlah.ulasan=0;

     for (let i = 0; i < 1; i++) {
      this.infitnite.push( this.infitnite.length );
    }
  }

  initializeItems(){
    this.makanan$ = this.makananList;
    this.filterCtrl.initializeItems();
  }

  presentPopover(myEvent) {
           let popover = this.popoverCtrl.create(FilterComponent);
          
          popover.present({
            ev: myEvent
          });

          popover.onDidDismiss((data,kab) => {
              if (data!=null) {
                this.initializeItems();
                this.filteredItems = data;
                if(this.filteredItems.ciamis) {
                  this.filterCtrl.cariBerdasarCiamis(this.filteredItems.ciamis,this.makanan$);
                  this.makanan$ = this.filterCtrl.makanan$;
                } else if(this.filteredItems.banjar) {
                  this.filterCtrl.cariBerdasarBanjar(this.filteredItems.banjar,this.makanan$);
                  this.makanan$ = this.filterCtrl.makanan$;
                } else if(kab!="backdrop") {
                  this.filterCtrl.cariBerdasarKabupatenCOD(kab,this.makanan$);
                  this.makanan$ = this.filterCtrl.makanan$;
                }

                if(this.filteredItems.kecamatan) {
                  this.filterCtrl.cariBerdasarKecamatan(this.filteredItems.kecamatan);
                  this.makanan$ = this.filterCtrl.makanan$;

                } else if (this.filteredItems.kabupaten) {
                  this.filterCtrl.cariBerdasarKabupaten(this.filteredItems.kabupaten);
                  this.makanan$ = this.filterCtrl.makanan$;
                  
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
    content: 'Memproses Data'
  });

  this.loading.present();

  setTimeout(() => {
    this.loading.dismiss();
  }, 7500);
}

  slice: number = 5;
  doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.slice += 5;
      infiniteScroll.complete();
    }, 200);
    
  }

focusOut() {
    let activeElement = <HTMLElement>document.activeElement;
    activeElement && activeElement.blur && activeElement.blur();
  }

  getItems(searchbar) {
    //Jika Baru Masuk Menu Langsung Search Kosong
    if(searchbar.srcElement.value==""&&this.makanan$==undefined) {
      this.kategori(null);
       this.focusOut();
       //this.content.scrollToBottom(500);
    } else if (searchbar.srcElement.value=="") {
      this.makanan$ = this.makananList;
      this.focusOut();
      this.content.scrollToBottom(500);
    } else if(this.makanan$==undefined) {
      alert("Pilih Dulu Kategori Yang Akan Dicari");
      return;
    } else {
      this.filterCtrl.getItems(searchbar,this.makanan$);
      this.makanan$ = this.filterCtrl.makanan$;
      this.focusOut();
      this.content.scrollToBottom(500);
    }
  }

  kategori(kat){
    return new Promise((resolve) => {
   this.presentLoadingDefault();
   this.pilih=true;

    var query = firebase.database().ref("user").orderByKey();
    var arrayDaganganData=[];
    query.once("value")
    .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      //Memunculkan UID dari setiap data
      var kunci = childSnapshot.key;
      var queryDagangan;
            //arrayUserUID.push(key);
            if(kat==null) {
              queryDagangan = firebase.database().ref("makanan").child(kunci).orderByChild('order');
            } else {
              queryDagangan = firebase.database().ref("makanan").child(kunci).orderByChild("kategori").equalTo(kat);
            }
            
            queryDagangan.once("value")
            .then(function(snapshopDagangan){
              snapshopDagangan.forEach(function(childSnapshopDagangan){
                var kunciDagangan = childSnapshopDagangan.key;
                var childDaganganData = childSnapshopDagangan.val();

                      //cek ongkir
                       var cod=[];
                       var ongkir=Object();
                       firebase.database().ref("user").child(kunci).child("ongkir").once("value")
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
                      if(childDaganganData.liker) {
                        Object.keys(childDaganganData.liker).forEach(function(key) {
                          if(firebase.auth().currentUser==null) {
                            disukai.suka=false;
                          } else {
                            if(key==firebase.auth().currentUser.uid) {
                              disukai.suka=true;
                            }
                          }
                        })
                      }
                      
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

                          var precision = Math.pow(10, 1);
                          ulas.rate = Math.ceil(ulas.rate * precision) / precision;
                          
                          ulas.jumlah = jumlahUlasan;  
                        }
                        
                      })
                 var jumlahLike = size(childDaganganData.liker);

                arrayDaganganData.push({
                  keyUser : kunci,
                  keyDagangan: kunciDagangan,
                  jumlahLike: jumlahLike,
                  dagang: childDaganganData,
                  ulasan: ulas,
                  disukai: disukai,
                  ongkir: ongkir
                });

                var m = arrayDaganganData.length, t, i;

                // While there remain elements to shuffle…
                while (m) {

                  // Pick a remaining element…
                  i = Math.floor(Math.random() * m--);

                  // And swap it with the current element.
                  t = arrayDaganganData[m];
                  arrayDaganganData[m] = arrayDaganganData[i];
                  arrayDaganganData[i] = t;
                }
              })  
            })
  });
    resolve(true);
    return [kat,arrayDaganganData];
});
    this.makanan$ = arrayDaganganData;
    this.makananList = arrayDaganganData;
    this.kat = kat;
    if (this.kat==null) {
      this.kat="Semua Jenis Makanan";
    }
  }).then((x) => {
      if (x) {this.loading.dismiss();
            this.content.scrollToBottom(500);
            return this.makanan$}
    });
  }

  ionViewDidLoad() {
    if(this.afAuth.auth.currentUser) {
      this.hitungNotif();
    }
    this.plt.registerBackButtonAction(() => {
       this.navCtrl.setRoot('TabsPage');
    });
    if(this.pilih) {
      this.kategori(this.kat).then(()=> {
        this.filterCtrl.makanan$ = this.makanan$;
        this.filterCtrl.makananList = this.makananList;
      });
    }
  }


  lihatDetail(item) {
    this.navCtrl.push('DetailPage',{item: item});
  }


  likerUid;
  like(item) {
    if(this.afAuth.auth.currentUser==null) {
      alert("Harus Login Dulu Supaya Bisa Menyukai");
      return;
    } else {
        //kondisi sudah dilike
        this.likerUid = this.afAuth.auth.currentUser.uid;
        var querySudahLike  = firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan);
        querySudahLike.once("value", snapshot => {

          const userData = snapshot.val();
          var jenis = item.dagang.jenis.toLowerCase();

        if (userData){
          //hapus Liker di makanan
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
          //kondisi belum dilike. nambah Liker di dagangan
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
            this.notifikasi.jenisDagangan = "makanan";
            this.notifikasi.jenis = "like";
            this.notifikasi.aktif = true;

            //nambah notifikasi like
            firebase.database().ref("notifikasi").child(item.keyUser).child("like").push(this.notifikasi);
          }

          item.jumlahLike = item.jumlahLike+1;
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
    //this.kategori(null).then(()=> {
      this.makanan$ = this.makananList;
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
    //});
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
