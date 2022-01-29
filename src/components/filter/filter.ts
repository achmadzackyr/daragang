import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { User } from '../../models/user';
//import { ItemsPage } from '../../config/config.pages';

/**
 * Generated class for the FilterComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'filter',
  templateUrl: 'filter.html'
})
export class FilterComponent {
  
  user = {} as User;
  kabupaten:any;
  PassedFilteredItems:any;
  itemsToFilterBy:any;
  items:any;
  ciamis=false;
  banjar=false;
  pangandaran=false;
  kotatasikmalaya=false;
  kabtasikmalaya=false;
  garut=false;
  sumedang=false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
     // this.PassedFilteredItems = this.navParams.data;
     // console.log('Items Page:', this.PassedFilteredItems);
   }

   itemClick(item,kabupaten) {
   	// console.log(item);
    // console.log(kabupaten);
   	this.viewCtrl.dismiss(item,kabupaten);
   }

   reset() {
   		var reset = "reset";
   		this.viewCtrl.dismiss(reset);
   }


onChange(kabupaten){
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

  } else if (this.user.kabupaten=="Banjar") {
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


onChangeCOD(kabupaten) {

    var kabupaten$ = kabupaten;
    if(kabupaten$.includes("Ciamis")) {
      this.ciamis=true;  
    } else {
      this.ciamis=false;
      this.user.ciamis=null;
    }
    if(kabupaten$.includes("Banjar")) {
      this.banjar=true;
    } else {
      this.banjar=false;
      this.user.banjar=null;
    }
    if(kabupaten$.includes("Pangandaran")) {
      this.pangandaran=true;
    } else {
      this.pangandaran=false;
      this.user.pangandaran=null;
    }
    if(kabupaten$.includes("Kab.Tasikmalaya")) {
      this.kabtasikmalaya=true;
    } else {
      this.kabtasikmalaya=false;
      this.user.kabtasikmalaya=null;
    }
    if(kabupaten$.includes("Kota Tasikmalaya")) {
      this.kotatasikmalaya=true;
    } else {
      this.kotatasikmalaya=false;
      this.user.kotatasikmalaya=null;
    }
    if(kabupaten$.includes("Garut")) {
      this.garut=true;
    } else {
      this.garut=false;
      this.user.garut=null;
    }
    if(kabupaten$.includes("Sumedang")) {
      this.sumedang=true;
    } else {
      this.sumedang=false;
      this.user.sumedang=null;
    }
  }

}
