import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, ToastController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

import { Dagangan } from '../../models/dagangan';
import { Ikuti } from '../../models/ikuti';

import * as firebase from 'firebase/app';
import { size } from "lodash";
import { AlertController } from 'ionic-angular';
import * as moment from 'moment';


@IonicPage()
@Component({
	selector: 'page-disukai',
	templateUrl: 'disukai.html',
})
export class DisukaiPage {

	following = false;

  	ikuti = {} as Ikuti;
  	//diikuti;
  	uid:any;

	ikuti$: Ikuti[];
	makanan$: Dagangan[];
	barang$ : Dagangan[];
	jasa$: Dagangan[];
	dagangan = {} as Dagangan;
	loading;
	DECIMAL_SEPARATOR=",";
    GROUP_SEPARATOR=".";
    jumlahMakanan=Object();
    jumlahBarang=Object();
    jumlahJasa=Object();
    jumlahPedagang=Object();
    jumlah=Object();
	
	private buttonColor: string = "primary";

	constructor(public navCtrl: NavController, private alertCtrl: AlertController, public afAuth: AngularFireAuth, 
		public loadingCtrl: LoadingController, public toastCtrl: ToastController, public plt: Platform) {
		this.jumlahMakanan.jumlah=0;
		this.jumlahBarang.jumlah=0;
		this.jumlahJasa.jumlah=0;
		this.jumlahPedagang.jumlah=0;

	    this.jumlah.like=0;
		this.jumlah.komentar=0;
		this.jumlah.ulasan=0;

		plt.registerBackButtonAction(() => {
       		this.navCtrl.setRoot('TabsPage');
    	});
	}


	ionViewWillEnter() {
		if(this.afAuth.auth.currentUser==null) {
			alert("Anda Harus Login Terlebih Dahulu");
			this.navCtrl.setRoot("LoginPage");
			return;
		} else {
			this.loadData();
			this.hitungNotif();
		}
	}

  loadData() {
  	return new Promise((resolve) => {

  		this.loading = this.loadingCtrl.create({
  			content: 'Mengambil Data'
  		});
  		this.loading.present();

  		var arrayDaganganData=[];
  		var arrayDaganganDataBarang=[];
  		var arrayDaganganDataJasa=[];
  		var arrayDiikuti=[];
  		var currentUID = firebase.auth().currentUser.uid;
  		var rate=0;
  		var sizeUlasan=0;
  		var jumlahMakanan=Object();
  		jumlahMakanan.jumlah=0;

  		var jumlahBarang=Object();
  		jumlahBarang.jumlah=0;

  		var jumlahJasa=Object();
  		jumlahJasa.jumlah=0;

  		var jumlahPedagang=Object();
  		jumlahPedagang.jumlah=0;

    	//tampilkan user=keydiikuti where keypengikut=current
    	var queryIkuti = firebase.database().ref("mengikuti").child(currentUID);
    	queryIkuti.once("value")
    	.then(function(snapshotIkuti) {
    		snapshotIkuti.forEach(function(childSnapshotIkuti) {

    				firebase.database().ref("user").orderByKey().equalTo(childSnapshotIkuti.key)
    				.once("value")
    				.then(function(snapshotDiikuti) {
    					jumlahPedagang.jumlah=(size(snapshotDiikuti.val()))+jumlahPedagang.jumlah;
    					jumlahPedagang.nama = "Pedagang Langgananku ("+jumlahPedagang.jumlah+")";
    					snapshotDiikuti.forEach(function(childSnapshotDiikuti) {

			    						firebase.database().ref("ulasan").orderByChild("keyPenjual").equalTo(childSnapshotDiikuti.key)
			    						.once("value")
			    						.then(function(snapshotUlasan) {
									          sizeUlasan = size(snapshotUlasan.val());
									          var ratingUlasan=0;
									          snapshotUlasan.forEach(function(childSnapshot) {
									            ratingUlasan = ratingUlasan+childSnapshot.val().rating;
									        })
									          return [ratingUlasan,sizeUlasan];
									      }).then(([x,y])=>{
									      	if(y==0) {
									      		rate = 0;
										      	sizeUlasan = y;
										      } else {
										      	rate = x/y;

										      	var precision = Math.pow(10, 1);
                          						rate = Math.ceil(rate * precision) / precision;

										      	sizeUlasan = y;
										      }
										      	
									      	arrayDiikuti.push({
				    							keyUser : childSnapshotDiikuti.key,
				    							dataUser : childSnapshotDiikuti.val(),
				    							rating: rate,
				    							sizeUlasan : sizeUlasan
				    						});
									      })
    					})
    				})
    			})
    	})



    	var query1 = firebase.database().ref("user").orderByKey();

    	query1.once("value")
    	.then(function(snapshot1) {
    		snapshot1.forEach(function(childSnapshot1) {

	    	      	//Memunculkan UID dari setiap data
	    	      	var kunciUser = childSnapshot1.key;


	    	      	var query = firebase.database().ref("user").child(currentUID).child("like").orderByKey();
	    	      	query.once("value")
	    	      	.then(function(snapshot) {
	    	      		snapshot.forEach(function(childSnapshot) {
				        //Memunculkan UID dari setiap data
				        var kunciDisukai = childSnapshot.key;

				        					//cek ongkir
					                       var cod=[];
					                       var ongkir=Object();
					                       firebase.database().ref("user").child(kunciUser).child("ongkir").once("value")
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
					                      firebase.database().ref("user").child(kunciUser).child("like").child(kunciDisukai).once("value")
					                      .then(function(snapshot) {
					                      	disukai.suka = snapshot.val();

					                      	return disukai;
					                      });
					                      

					                      var jumlahUlasan=0;
					                      var rate = 0;
					                      var ulas=Object();
					                      firebase.database().ref("ulasan").orderByChild("keyDagangan").equalTo(kunciDisukai).once("value")
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

				            //arrayUserUID.push(key);
				            var queryDagangan = firebase.database().ref("makanan").child(kunciUser).orderByKey().equalTo(kunciDisukai);
				            queryDagangan.once("value")
				            .then(function(snapshopDagangan){
				            	jumlahMakanan.jumlah=(size(snapshopDagangan.val()))+jumlahMakanan.jumlah;
				            	jumlahMakanan.nama = "Makanan ("+jumlahMakanan.jumlah+")";
				            	snapshopDagangan.forEach(function(childSnapshopDagangan){
				            		
				            		var childDaganganData = childSnapshopDagangan.val();

				            		var jumlahLike = size(childDaganganData.liker);


				            		arrayDaganganData.push({
				            			keyUser : kunciUser,
				            			keyDagangan: kunciDisukai,
				            			jumlahLike: jumlahLike,
				            			dagang: childDaganganData,
				            			ulasan: ulas,
				            			disukai: disukai,
				            			ongkir: ongkir
				            		});

				            	})  
				            })



				            var queryDaganganBarang = firebase.database().ref("barang").child(kunciUser).orderByKey().equalTo(kunciDisukai);
				            queryDaganganBarang.once("value")
				            .then(function(snapshopDagangan){
				            	jumlahBarang.jumlah=(size(snapshopDagangan.val()))+jumlahBarang.jumlah;
				            	jumlahBarang.nama = "Barang ("+jumlahBarang.jumlah+")";
				            	snapshopDagangan.forEach(function(childSnapshopDagangan){
				            		
				            		var childDaganganData = childSnapshopDagangan.val();

				            		var jumlahLike = size(childDaganganData.liker);


				            		arrayDaganganDataBarang.push({
				            			keyUser : kunciUser,
				            			keyDagangan: kunciDisukai,
				            			jumlahLike: jumlahLike,
				            			dagang: childDaganganData,
				            			ulasan: ulas,
				            			disukai: disukai,
				            			ongkir: ongkir
				            		});

				            	})  
				            })



				            var queryDaganganBarangJasa = firebase.database().ref("jasa").child(kunciUser).orderByKey().equalTo(kunciDisukai);
				            queryDaganganBarangJasa.once("value")
				            .then(function(snapshopDagangan){
				            	jumlahJasa.jumlah=(size(snapshopDagangan.val()))+jumlahJasa.jumlah;
				            	jumlahJasa.nama = "Jasa ("+jumlahJasa.jumlah+")";
				            	snapshopDagangan.forEach(function(childSnapshopDagangan){
				            		
				            		var childDaganganData = childSnapshopDagangan.val();

				            		var jumlahLike = size(childDaganganData.liker);


				            		arrayDaganganDataJasa.push({
				            			keyUser : kunciUser,
				            			keyDagangan: kunciDisukai,
				            			jumlahLike: jumlahLike,
				            			dagang: childDaganganData,
				            			ulasan: ulas,
				            			disukai: disukai,
				            			ongkir: ongkir
				            		});

				            	})  
				            })



				        });

});

});
resolve(true);
return [arrayDaganganData,arrayDaganganDataBarang,arrayDaganganDataJasa,arrayDiikuti,jumlahMakanan,jumlahBarang,jumlahJasa,jumlahPedagang];
});

this.makanan$ = arrayDaganganData;
this.barang$ = arrayDaganganDataBarang;
this.jasa$ = arrayDaganganDataJasa;
this.ikuti$ = arrayDiikuti;
this.jumlahMakanan = jumlahMakanan;
this.jumlahBarang = jumlahBarang;
this.jumlahJasa = jumlahJasa;
this.jumlahPedagang = jumlahPedagang;

	}).then((x)=>{
		if(x) this.loading.dismiss();
	})
}

likerUid;
like(item) {
	this.likerUid = firebase.auth().currentUser.uid;

	var querySudahLike  = firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan);
	querySudahLike.once("value", snapshot => {

		const userData = snapshot.val();

		var jenis = item.dagang.jenis.toLowerCase();

	if (userData){
	      //nambah Liker di makanan
	      //rek makanan ganti jadi kategori
	      firebase.database().ref(jenis).child(item.keyUser).child(item.keyDagangan).child("liker").child(this.likerUid).remove();
	      
	      //nambah like di user
	      firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan).remove();

	      item.jumlahLike = item.jumlahLike-1;
	      this.buttonColor = "primary";
	      this.toastCtrl.create({
	      	message: `${item.dagang.namaDagangan}, batal disukai`,
	      	duration: 3000,position: 'top'
	      }).present();      
		//      this.ionViewDidLoad();
		this.ionViewWillEnter();
	} else {
      //nambah Liker di makanan
      firebase.database().ref(jenis).child(item.keyUser).child(item.keyDagangan).child("liker").child(this.likerUid).set("true");
      
      //nambah like di user
      firebase.database().ref("user").child(this.likerUid).child("like").child(item.keyDagangan).set("true");

      item.jumlahLike = item.jumlahLike+1;
      this.buttonColor = "primary-light";  
      this.toastCtrl.create({
      	message: `${item.dagang.namaDagangan}, telah disukai`,
      	duration: 3000,position: 'top'
      }).present();      
  	}

})
}


batalSuka(item) {
	let alert = this.alertCtrl.create({
		title: 'Batal Disukai?',
		message: 'Hapus '+item.dagang.namaDagangan+' dari daftar disukai?',
		buttons: [
		{
			text: 'Tidak',
			role: 'cancel',
			handler: () => {
				return;
			}
		},
		{
			text: 'Ya',
			handler: () => {
				this.like(item);
			}
		}
		]
	});
	alert.present();
}

lihatDetail(item) {
    //this.toastCtrl.create('Post image clicked');
    this.navCtrl.push('DetailPage',{item: item});
}

penjual(keyUser){
	this.navCtrl.push("ProfilPage",{keyUser : keyUser});
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


  batalIkut(item) {
	let alert = this.alertCtrl.create({
		title: 'Berhenti Berlanggan?',
		message: 'Hapus '+item.dataUser.nama+' dari daftar berlanggan?',
		buttons: [
		{
			text: 'Tidak',
			role: 'cancel',
			handler: () => {
				return;
			}
		},
		{
			text: 'Ya',
			handler: () => {
				this.prosesBatalIkut(item);
			}
		}
		]
	});
	alert.present();
}

  prosesBatalIkut(item) {
    this.following = null;
    this.ikuti.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
    const orderNumber = Math.floor(0-Date.now());
    this.ikuti.order = orderNumber;
    this.ikuti.keyDiikuti = this.uid;
    this.ikuti.keyPengikut = this.afAuth.auth.currentUser.uid;

    firebase.database().ref("mengikuti").child(this.afAuth.auth.currentUser.uid).child(item.keyUser).remove().then(()=>{
    	this.ionViewWillEnter();
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
