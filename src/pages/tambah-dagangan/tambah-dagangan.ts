import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController, Navbar,
 AlertController, Platform } from 'ionic-angular';

import { Dagangan } from '../../models/dagangan';

import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import {Camera, CameraOptions} from '@ionic-native/camera';
import { User } from '../../models/user';

import 'rxjs/add/operator/map';
import 'firebase/storage';
import * as firebase from 'firebase/app';
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-tambah-dagangan',
  templateUrl: 'tambah-dagangan.html',
})
export class TambahDaganganPage {
  @ViewChild('navbar') navBar: Navbar;
  @ViewChild('myInput') myInput: ElementRef;
	dagangan = {} as Dagangan;
	uid : any;
  items: any;

  public base64Image : string;
  user = {} as User;
  basePath: string;
  loading;
  loadingDagangan;
  loadingFoto;

  employess: AngularFireList<any>;

  selectedPhoto;
  currentImage;
  imageName;
  authId;
  captureDataUrl: string;
  userData;
  itemRef: AngularFireObject<any>;
  jenis:any;

  DECIMAL_SEPARATOR=",";
  GROUP_SEPARATOR=".";
  budget=0;
  item;
  edit=false;
  kat=false;

  preorder=false;

  nominal:any;
  satuan:string;
  jumlah=Object();


  constructor(public navCtrl: NavController, public navParams: NavParams, private afDatabase: AngularFireDatabase, 
    public afAuth: AngularFireAuth, private camera : Camera, private alrtCtrl : AlertController,
    private actionSheetCtrl: ActionSheetController, public loadingCtrl: LoadingController, public plt: Platform) {
    this.item = navParams.get('item');
    this.edit = navParams.get('edit');

    this.jumlah.like=0;
    this.jumlah.komentar=0;
    this.jumlah.ulasan=0;

    plt.registerBackButtonAction(() => {
       this.showPromptBack();
    });

    if(this.edit) {

      this.dagangan = this.item.dagang;
      this.budget = this.dagangan.harga;
      this.currentImage = this.dagangan.fotoDagangan;
      var numberPattern = /\d+/g;
      if(this.dagangan.minimal.indexOf("Pcs / Pasang / Order")>=0) {
        this.nominal = this.dagangan.minimal.match(numberPattern);
        this.satuan = "Pcs / Pasang / Order";
      } else if(this.dagangan.minimal.indexOf("Kg")>=0) {
        this.nominal = this.dagangan.minimal.match(numberPattern);
        this.satuan = "Kg";
      } else {
        this.nominal = this.dagangan.minimal.match(numberPattern);
        this.satuan = "Total Belanja";
      }

      if(this.dagangan.stock=="Preorder") {
        this.onChangeStock(this.dagangan.stock);
      }
    } else {
      this.hitungNotif();
        this.satuan = "Pcs / Pasang / Order";
        afAuth.authState.take(1).subscribe(auth => {
          //akses ke database dengan primary uid
          this.authId = auth.uid;
          //Metode mengambil value sebuah field dalam database start
          this.itemRef = afDatabase.object(`user/${this.authId}`);
          this.itemRef.snapshotChanges().map(action => {
          const $key = action.payload.key;
          const data = { $key, ...action.payload.val() };
          return data;
          }).subscribe(item => {
            var kosong=[];
          if (item.hp=="" || item.hp==null || item.alamat=="" || item.alamat==null || item.kabupaten==null || item.kecamatan==null || item.hariBuka==null || 
            item.jamBuka==null || item.jamTutup==null || item.deskripsi==null || (item.ciamis==null && item.banjar==null)){
            
            if(item.hp=="" || item.hp==null) {
              kosong.push(' No.HP Kosong');
            }

            if(item.deskripsi==null || item.deskripsi=="") {
              kosong.push(' Deskripsi Toko Kosong');
            }

            if(item.alamat==null || item.alamat=="") {
              kosong.push(' Alamat Kosong');
            }

            if(item.kabupaten==null) {
              kosong.push(' Kabupaten Kosong');
            }

            if(item.kecamatan==null) {
              kosong.push(' Kecamatan Kosong');
            }

            if(item.hariBuka==null) {
              kosong.push(' Hari Buka Kosong');
            }

            if(item.jamBuka==null) {
              kosong.push(' Jam Buka Kosong');
            }

            if(item.jamTutup==null) {
              kosong.push(' Jam Tutup Kosong');
            }

              if(item.ciamis==null && item.banjar==null) {
                //alert('Harap Pilih Minimal 1 Wilayah Pengiriman');
                kosong.push(' Pilih Minimal 1 Wilayah Pengiriman');
              }
              alert(kosong);
              alert('Mohon Lengkapi Data Penjual Terlebih Dulu!');
              this.navCtrl.setRoot('EditProfilPage');
          } else {
            if(item.ciamis==null) {
              item.ciamis="";
            }
            if(item.banjar==null) {
              item.banjar="";
            }

            this.dagangan.foto = item.foto,
            this.dagangan.nama = item.nama,
            this.dagangan.hp= item.hp,
            this.dagangan.email= item.email,
            this.dagangan.alamat= item.alamat,
            this.dagangan.kabupaten= item.kabupaten,
            this.dagangan.kecamatan= item.kecamatan,
            this.dagangan.ciamis= item.ciamis,
            this.dagangan.banjar= item.banjar,
            this.dagangan.hariBuka= item.hariBuka,
            this.dagangan.jamBuka= item.jamBuka,
            this.dagangan.jamTutup= item.jamTutup,
            this.dagangan.joinDate = item.joinDate
          }
           });
        });
    }
  }

ionViewDidLoad() {
  this.navBar.backButtonClick = (ev:UIEvent) => {
      this.showPromptBack();
    }
}

showPromptBack() {
  let prompt = this.alrtCtrl.create({
    title: 'Peringatan',
    message: "Yakin Membatalkan Tambah Dagangan?",
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

  ubahKategori(jenis) {
    this.kat = !this.kat;
    this.onChange(jenis);
  }

  ubahJenis() {
    alert("Hanya Bisa Mengubah Kategori, Jenis Dagangan Tidak Bisa Diubah");
    return;
  }

  simpanKategori(){
    this.kat = !this.kat;
  }

  editDagangan(dagangan : Dagangan){

      return new Promise((resolve) => {
      this.loadingDagangan = this.loadingCtrl.create({
        content: 'Mengubah Dagangan'
      });
      this.loadingDagangan.present();
    //console.log(dagangan);
    
      if(this.dagangan.jenis==null)
      {
        alert(' Jenis Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.kategori==null)
      {
        alert(' Kategori Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.namaDagangan==null || this.dagangan.namaDagangan=="")
      {
        alert(' Nama Dagangan Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.deskripsiDagangan==null || this.dagangan.deskripsiDagangan=="")
      {
        alert(' Deskripsi Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.stock==null)
      {
        alert(' Stock Kosong');
        this.loadingDagangan.dismiss();
        return;
      } else if(this.dagangan.stock=="Preorder") {
        if(this.dagangan.preorder==null) {
          alert(' Lama Preorder Kosong');
          this.loadingDagangan.dismiss();
          return;
        }
      }

      if(this.nominal==null||this.nominal==0)
      {
        alert(' Minimal Pemesanan Kosong');
        this.loadingDagangan.dismiss();
        return;
      }

      if(this.budget==null||this.budget<1)
      {
        alert(' Harga Kosong / Tidak Valid');
        this.loadingDagangan.dismiss();
        return;
      }

                this.dagangan.harga = this.budget;
                if(this.satuan=="Total Belanja") {
                  this.dagangan.minimal = this.satuan+" Rp"+this.nominal;
                } else {
                  this.dagangan.minimal = this.nominal+" "+this.satuan;
                }

                //console.log(this.item);

                firebase.database().ref(this.dagangan.jenis.toLowerCase()).child(this.afAuth.auth.currentUser.uid).child(this.item.keyDagangan)
                .update({
                  "namaDagangan": this.dagangan.namaDagangan,
                  "minimal": this.dagangan.minimal,
                  "kategori": this.dagangan.kategori,
                  "jenis": this.dagangan.jenis,
                  "harga": this.dagangan.harga,
                  "deskripsiDagangan": this.dagangan.deskripsiDagangan

                }).then(()=>{
                    //console.log(this.item);
                    this.item.dagang = this.dagangan;
                    this.jenis = this.dagangan.jenis.toLowerCase();
                    this.authId = this.item.keyUser;
                      this.imageName = this.item.keyDagangan;
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
                      if(this.currentImage) {
                        resolve(true);
                      }
                });
  }).then((x) => {
    if(x) {
      this.navCtrl.push("DetailPage",{item:this.item, edited:true});
      this.loadingDagangan.dismiss();
    };
  })
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

  uploadGallery() {
    return new Promise((resolve) => {
    this.loadingFoto = this.loadingCtrl.create({
      content: 'Mengunggah Foto'
    });
    this.loadingFoto.present();
    let storageRef = firebase.storage().ref();
    // Create a timestamp as filename
    const filename = this.imageName;

    // Create a reference to 'images/todays-date.jpg'
    const imageRef = storageRef.child('dagangan').child(this.authId+'/'+filename+'.jpg');

    var persen = 0;
    imageRef.putString(this.captureDataUrl, firebase.storage.StringFormat.DATA_URL)
    .then((snapshot)=> {

      persen = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (persen==100) {
          this.dagangan.fotoDagangan = snapshot.downloadURL;
            // Do something here when the data is succesfully uploaded!
            firebase.database().ref(this.jenis+'/'+this.authId+'/'+this.imageName).update({
              "fotoDagangan": this.dagangan.fotoDagangan
            }).then(()=>{
              resolve(true);       
            });
        }
    });
  }).then(() => {
      this.loadingFoto.dismiss();
  });
  }
  
  //persen;
  uploadCamera(){
    return new Promise((resolve) => {
    if(this.selectedPhoto){
      this.loadingFoto = this.loadingCtrl.create({
        content: 'Mengunggah Foto'
      });
      this.loadingFoto.present();

      var persen = 0;
      var uploadTask =  firebase.storage().ref().child('dagangan').child(this.authId+'/'+this.imageName+'.jpg');
      uploadTask.put(this.selectedPhoto).then(savePic=> {

        persen = (savePic.bytesTransferred / savePic.totalBytes) * 100;
        if (persen==100) {
          this.dagangan.fotoDagangan = savePic.downloadURL;
          firebase.database().ref(this.jenis+'/'+this.authId+'/'+this.imageName).update({
            "fotoDagangan": this.dagangan.fotoDagangan
          })
          .then(()=>{
            resolve(true);       
          })
        }
      });
    }
   }).then(() => {
        this.loadingFoto.dismiss();
     });
  }

  tambahDagangan(dagangan: Dagangan) {
    return new Promise((resolve) => {
      this.loadingDagangan = this.loadingCtrl.create({
        content: 'Menambah Dagangan'
      });
      this.loadingDagangan.present();

      if(this.dagangan.jenis==null)
      {
        alert(' Jenis Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.kategori==null)
      {
        alert(' Kategori Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.namaDagangan==null || this.dagangan.namaDagangan=="")
      {
        alert(' Nama Dagangan Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.deskripsiDagangan==null || this.dagangan.deskripsiDagangan=="")
      {
        alert(' Deskripsi Kosong');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.selectedPhoto==null&&this.captureDataUrl==null)
      {
        alert(' Dagangan Wajib Memasang Foto');
        this.loadingDagangan.dismiss();
        return;
      }
      if(this.dagangan.stock==null)
      {
        alert(' Stock Kosong');
        this.loadingDagangan.dismiss();
        return;
      } else if(this.dagangan.stock=="Preorder") {
        if(this.dagangan.preorder==null) {
          alert(' Lama Preorder Kosong');
          this.loadingDagangan.dismiss();
          return;
        }
      }

      if(this.nominal==null||this.nominal==0)
      {
        alert(' Minimal Pemesanan Kosong');
        this.loadingDagangan.dismiss();
        return;
      }

      if(this.budget==null||this.budget<1)
      {
        alert(' Harga Kosong / Tidak Valid');
        this.loadingDagangan.dismiss();
        return;
      }

                this.dagangan.createDate = moment().format('DD-MM-YYYY HH:mm [WIB]');
                this.dagangan.status = "Aktif";
                this.dagangan.jumlahKomentar = 0;
                this.dagangan.fotoDagangan = "null";
                const orderNumber = Math.floor(0-Date.now());
                this.dagangan.order = orderNumber;
                this.dagangan.harga = this.budget;
                if(this.satuan=="Total Belanja") {
                  this.dagangan.minimal = this.satuan+" Rp"+this.nominal;
                } else {
                  this.dagangan.minimal = this.nominal+" "+this.satuan;
                }
                


                if(this.dagangan.jenis=="Makanan") {
                  this.employess = this.afDatabase.list(`makanan/${this.authId}`);
                  this.jenis="makanan";

                } else if(this.dagangan.jenis=="Barang") {
                  this.employess = this.afDatabase.list(`barang/${this.authId}`);
                  this.jenis="barang";

                } else if(this.dagangan.jenis=="Jasa") {
                  this.employess = this.afDatabase.list(`jasa/${this.authId}`);
                  this.jenis="jasa";
                }
                this.employess.push(this.dagangan).then(newEmployee => {
                      //mendapatkan id item yang baru diinput ke database
                      const newId = newEmployee.key;

                      this.imageName = newId;
                      if(this.selectedPhoto) {
                        this.uploadCamera().then(()=>{
                          resolve(true);
                        });
                      } else 
                      if(this.captureDataUrl) {
                        this.uploadGallery().then(()=>{
                          resolve(true);
                        });
                      }
                    });
    
  }).then((x) => {
    if(x) {
      this.navCtrl.setRoot('ProfilPage',{refresh : true});
      this.loadingDagangan.dismiss();
    };
  })
  }

  changePic(): void {
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

  format(valString) {
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

  onChange(jenis){
    if (this.dagangan.jenis=="Makanan") {
      this.items = [
        { text: 'Paket Nasi', value: 'Paket Nasi' },
        { text: 'Paket Ayam & Ikan', value: 'Paket Ayam & Ikan' },

        { text: 'Mie Ayam & Bakso', value: 'Mie Ayam & Bakso' },
        { text: 'Seblak & Pedas-pedas', value: 'Seblak & Pedas-pedas' },
        { text: 'Minuman', value: 'Minuman' },

        { text: 'Buah & Manis-manis', value: 'Buah & Manis-manis' },
        { text: 'Snack & Jajanan', value: 'Snack & Jajanan' },
        { text: 'Bumbu & Bahan Mentah', value: 'Bumbu & Bahan Mentah' },

        { text: 'Martabak', value: 'Martabak' },
        { text: 'Pizza & Burger', value: 'Pizza & Burger' },
        { text: 'Roti & Kue', value: 'Roti & Kue' },

        { text: 'Sate & Gule', value: 'Sate & Gule' },
        { text: 'Steak & Sosis', value: 'Steak & Sosis' },
        { text: 'Japanese Food', value: 'Japanese Food' },

        { text: 'Sea Food', value: 'Sea Food' },
        { text: 'Makanan Bayi', value: 'Makanan Bayi' },
        { text: 'Makanan Lainnya', value: 'Makanan Lainnya' }
      ];

    } else if (this.dagangan.jenis=="Barang") {
      this.items = [
        { text: 'Perawatan & Kecantikan', value: 'Perawatan & Kecantikan' },
        { text: 'Kesehatan', value: 'Kesehatan' },

        { text: 'Fashion Pria', value: 'Fashion Pria' },
        { text: 'Fashion Wanita', value: 'Fashion Wanita' },
        { text: 'Fashion Anak', value: 'Fashion Anak' },

        { text: 'Perlengkapan Bayi', value: 'Perlengkapan Bayi' },
        { text: 'Perabot Rumah Tangga', value: 'Perabot Rumah Tangga' },
        { text: 'Elektronik', value: 'Elektronik' },

        { text: 'Handphone & Aksesorisnya', value: 'Handphone & Aksesorisnya ' },
        { text: 'Komputer & Aksesorisnya', value: 'Komputer & Aksesorisnya' },
        { text: 'Laptop & Aksesorisnya', value: 'Laptop & Aksesorisnya' },

        { text: 'Olahraga', value: 'Olahraga' },
        { text: 'Hobi & Koleksi', value: 'Hobi & Koleksi' },
        { text: 'Souvenir & Kado', value: 'Souvenir & Kado' },

        { text: 'Otomotif', value: 'Otomotif' },
        { text: 'Alat Tulis Kantor', value: 'Alat Tulis Kantor' },
        { text: 'Barang Lainnya', value: 'Barang Lainnya' }
      ];
    } else {
      this.items = [
        { text: 'Bangunan', value: 'Bangunan' },
        { text: 'Bengkel', value: 'Bengkel' },

        { text: 'Desain', value: 'Desain' },
        { text: 'Jahit', value: 'Jahit' },
        { text: 'Komputer & Internet', value: 'Komputer & Internet' },

        { text: 'Kursus', value: 'Kursus' },
        { text: 'Asisten Rumah Tangga', value: 'Asisten Rumah Tangga' },
        { text: 'Baby Sitter', value: 'Baby Sitter' },

        { text: 'Pernikahan', value: 'Pernikahan' },
        { text: 'Rental Mobil & Motor', value: 'Rental Mobil & Motor' },
        { text: 'Service Elektronik', value: 'Service Elektronik' },

        { text: 'Tour & Travel', value: 'Tour & Travel' },
        { text: 'Barber & Salon', value: 'Barber & Salon' },
        { text: 'Jasa Lainnya', value: 'Jasa Lainnya' }
      ];

    }
    
  }

  onChangeStock(stock){
    if (this.dagangan.stock=="Preorder") {
      this.preorder=true;
    } else {
      this.preorder=false;
    }
  }

  resize() {
    var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
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
