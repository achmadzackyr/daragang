import { Injectable } from '@angular/core';


@Injectable()
export class FilterService {

	makanan$: Array<any>;
	public makananList:Array<any>;

  pedagang$: Array<any>;
  public pedagangList:Array<any>;

  barang$: Array<any>;
  public barangList:Array<any>;

  jasa$: Array<any>;
  public jasaList:Array<any>;

	constructor() { }

	initializeItems(){
    this.makanan$ = this.makananList;
  }

  initializeItemsPenjual(){
    this.pedagang$ = this.pedagangList;
  }

  initializeItemsBarang(){
    this.barang$ = this.barangList;
  }

  initializeItemsJasa(){
    this.jasa$ = this.jasaList;
  }

  //MODUL MAKANAN

  cariBerdasarKabupatenCOD(kabupaten,makanan) {
    this.makanan$=makanan;
    
    // if the value is an empty string don't filter the items
    if (!kabupaten) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(kabupaten.toLowerCase()=="banjar") {
          if(v.dagang.banjar) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="ciamis") {
          
        if(v.dagang.ciamis) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="pangandaran") {
          
        if(v.dagang.pangandaran) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="kota tasikmalaya") {
          
        if(v.dagang.kotatasikmalaya) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="kab.tasikmalaya") {
          
        if(v.dagang.kabtasikmalaya) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="garut") {
          
        if(v.dagang.garut) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="sumedang") {
          
        if(v.dagang.sumedang) {
            return true;
          }
          return false;
      }
    });
    //console.log(kabupaten, this.makanan$.length);

  }

  cariBerdasarBanjar(kecamatan,makanan) {
    this.makanan$=makanan;

    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.banjar && kecamatan) {
        if (v.dagang.banjar.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.makanan$.length);

  }

  cariBerdasarCiamis(kecamatan,makanan) {
    this.makanan$=makanan;
    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.ciamis && kecamatan) {
        if (v.dagang.ciamis.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarPangandaran(kecamatan,makanan) {
    this.makanan$=makanan;
    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }
    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.pangandaran && kecamatan) {
        if (v.dagang.pangandaran.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.makanan$.length);
  }

  cariBerdasarKabtasikmalaya(kecamatan,makanan) {
    this.makanan$=makanan;
    if (!kecamatan) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.kabtasikmalaya && kecamatan) {
        if (v.dagang.kabtasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKotatasikmalaya(kecamatan,makanan) {
    this.makanan$=makanan;
    if (!kecamatan) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.kotatasikmalaya && kecamatan) {
        if (v.dagang.kotatasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarGarut(kecamatan,makanan) {
    this.makanan$=makanan;
    if (!kecamatan) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.garut && kecamatan) {
        if (v.dagang.garut.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarSumedang(kecamatan,makanan) {
    if (!kecamatan) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.sumedang && kecamatan) {
        if (v.dagang.sumedang.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

	cariBerdasarKecamatan(kecamatan) {

    if (!kecamatan) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.kecamatan && kecamatan) {
        if (v.dagang.kecamatan.toLowerCase().indexOf(kecamatan.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.makanan$.length);

  }

  cariBerdasarKabupaten(kabupaten) {

    if (!kabupaten) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.kabupaten && kabupaten) {
        if (v.dagang.kabupaten.toLowerCase().indexOf(kabupaten.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    // console.log(kabupaten, this.makanan$.length);

  }

  getItems(searchbar,makanan) {
    // Reset items back to all of the items
   //this.initializeItems();
   //console.log(makanan);
    this.makanan$=makanan;
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;
    

    // if the value is an empty string don't filter the items
    if (!q) {
      return;
    }

    this.makanan$ = this.makanan$.filter((v) => {
      if(v.dagang.namaDagangan && q) {
        if (v.dagang.namaDagangan.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(q, this.makanan$.length);

  }


  //MODUL PENJUAL
  cariBerdasarKabupatenCODPenjual(kabupaten) {

    if (!kabupaten) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(kabupaten.toLowerCase()=="banjar") {
          if(v.dataUser.banjar) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="ciamis") {
          
        if(v.dataUser.ciamis) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="pangandaran") {
          
        if(v.dataUser.pangandaran) {
            return true;
          }
          return false;
        }
        else if(kabupaten.toLowerCase()=="kab.tasikmalaya") {
        if(v.dataUser.kabtasikmalaya) {
            return true;
          }
          return false;
        }
        else if(kabupaten.toLowerCase()=="kota tasikmalaya") {
        if(v.dataUser.kotatasikmalaya) {
            return true;
          }
          return false;
        }
      else if(kabupaten.toLowerCase()=="garut") {
        if(v.dataUser.garut) {
            return true;
          }
          return false;
        }
      else if(kabupaten.toLowerCase()=="sumedang") {
        if(v.dataUser.sumedang) {
            return true;
          }
          return false;
        }
    });

  }

  cariBerdasarBanjarPenjual(kecamatan) {
    
    if (!kecamatan) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.banjar && kecamatan) {
        if (v.dataUser.banjar.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });

  }

  cariBerdasarCiamisPenjual(kecamatan) {
    if (!kecamatan) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.ciamis && kecamatan) {
        if (v.dataUser.ciamis.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarPangandaranPenjual(kecamatan) {
    if (!kecamatan) {
      return;
    }
    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.pangandaran && kecamatan) {
        if (v.dataUser.pangandaran.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKabtasikmalayaPenjual(kecamatan) {
    if (!kecamatan) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.kabtasikmalaya && kecamatan) {
        if (v.dataUser.kabtasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKotatasikmalayaPenjual(kecamatan) {
    if (!kecamatan) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.kotatasikmalaya && kecamatan) {
        if (v.dataUser.kotatasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarGarutPenjual(kecamatan) {
    if (!kecamatan) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.garut && kecamatan) {
        if (v.dataUser.garut.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarSumedangPenjual(kecamatan) {
    if (!kecamatan) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.sumedang && kecamatan) {
        if (v.dataUser.sumedang.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  getItemsPenjual(searchbar) {

    // Reset items back to all of the items
    this.initializeItemsPenjual();
    
    
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;
    

    // if the value is an empty string don't filter the items
    if (!q) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.nama && q) {
        if (v.dataUser.nama.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(q, this.pedagang$.length);

  }

  cariBerdasarKabupatenPenjual(kabupaten) {
    if (!kabupaten) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.kabupaten && kabupaten) {
        if (v.dataUser.kabupaten.toLowerCase().indexOf(kabupaten.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

    cariBerdasarKecamatanPenjual(kecamatan) {

    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }

    this.pedagang$ = this.pedagang$.filter((v) => {
      if(v.dataUser.kecamatan && kecamatan) {
        if (v.dataUser.kecamatan.toLowerCase().indexOf(kecamatan.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });

  }

  //MODUL BARANG

  cariBerdasarKabupatenCODBarang(kabupaten,barang) {
    this.barang$ = barang;
    // if the value is an empty string don't filter the items
    if (!kabupaten) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(kabupaten.toLowerCase()=="banjar") {
          if(v.dagang.banjar) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="ciamis") {
          
        if(v.dagang.ciamis) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="pangandaran") {
          
        if(v.dagang.pangandaran) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="kota tasikmalaya") {
          
        if(v.dagang.kotatasikmalaya) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="kab.tasikmalaya") {
          
        if(v.dagang.kabtasikmalaya) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="garut") {
          
        if(v.dagang.garut) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="sumedang") {
          
        if(v.dagang.sumedang) {
            return true;
          }
          return false;
      }
    });
    //console.log(kabupaten, this.barang$.length);

  }

  cariBerdasarBanjarBarang(kecamatan,barang) {
    // Reset items back to all of the items
    //this.initializeItems();

    this.barang$ = barang;

    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.banjar && kecamatan) {
        if (v.dagang.banjar.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.barang$.length);

  }

  cariBerdasarCiamisBarang(kecamatan,barang) {
    // Reset items back to all of the items
    //this.initializeItems();

    this.barang$ = barang;
    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.ciamis && kecamatan) {
        if (v.dagang.ciamis.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.barang$.length);

  }

  cariBerdasarPangandaranBarang(kecamatan,barang) {
    this.barang$=barang;
    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }
    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.pangandaran && kecamatan) {
        if (v.dagang.pangandaran.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.barang$.length);
  }

  cariBerdasarKabtasikmalayaBarang(kecamatan,barang) {
    this.barang$=barang;
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.kabtasikmalaya && kecamatan) {
        if (v.dagang.kabtasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKotatasikmalayaBarang(kecamatan,barang) {
    this.barang$=barang;
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.kotatasikmalaya && kecamatan) {
        if (v.dagang.kotatasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarGarutBarang(kecamatan,barang) {
    this.barang$=barang;
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.garut && kecamatan) {
        if (v.dagang.garut.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarSumedangBarang(kecamatan,barang) {
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.sumedang && kecamatan) {
        if (v.dagang.sumedang.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKecamatanBarang(kecamatan) {

    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.kecamatan && kecamatan) {
        if (v.dagang.kecamatan.toLowerCase().indexOf(kecamatan.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.barang$.length);

  }

  cariBerdasarKabupatenBarang(kabupaten) {

    if (!kabupaten) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.kabupaten && kabupaten) {
        if (v.dagang.kabupaten.toLowerCase().indexOf(kabupaten.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    console.log(kabupaten, this.barang$.length);

  }

  getItemsBarang(searchbar,barang) {
    // Reset items back to all of the items
   //this.initializeItems();
   //console.log(barang);
    this.barang$=barang;
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;
    

    // if the value is an empty string don't filter the items
    if (!q) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.namaDagangan && q) {
        if (v.dagang.namaDagangan.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(q, this.barang$.length);

  }

  //MODUL JASA

  cariBerdasarKabupatenCODJasa(kabupaten,jasa) {
    this.jasa$ = jasa;
    // if the value is an empty string don't filter the items
    if (!kabupaten) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(kabupaten.toLowerCase()=="banjar") {
          if(v.dagang.banjar) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="ciamis") {
          
        if(v.dagang.ciamis) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="pangandaran") {
          
        if(v.dagang.pangandaran) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="kota tasikmalaya") {
          
        if(v.dagang.kotatasikmalaya) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="kab.tasikmalaya") {
          
        if(v.dagang.kabtasikmalaya) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="garut") {
          
        if(v.dagang.garut) {
            return true;
          }
          return false;
      } else if(kabupaten.toLowerCase()=="sumedang") {
          
        if(v.dagang.sumedang) {
            return true;
          }
          return false;
      }
    });
    //console.log(kabupaten, this.barang$.length);

  }

  cariBerdasarBanjarJasa(kecamatan,barang) {
    // Reset items back to all of the items
    //this.initializeItems();

    this.barang$ = barang;

    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.banjar && kecamatan) {
        if (v.dagang.banjar.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.barang$.length);

  }

  cariBerdasarCiamisJasa(kecamatan,barang) {
    // Reset items back to all of the items
    //this.initializeItems();

    this.barang$ = barang;
    // if the value is an empty string don't filter the items
    if (!kecamatan) {
      return;
    }

    this.barang$ = this.barang$.filter((v) => {
      if(v.dagang.ciamis && kecamatan) {
        if (v.dagang.ciamis.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarPangandaranJasa(kecamatan,jasa) {
    this.jasa$=jasa;
    if (!kecamatan) {
      return;
    }
    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.pangandaran && kecamatan) {
        if (v.dagang.pangandaran.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKabtasikmalayaJasa(kecamatan,jasa) {
    this.jasa$=jasa;
    if (!kecamatan) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.kabtasikmalaya && kecamatan) {
        if (v.dagang.kabtasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKotatasikmalayaJasa(kecamatan,jasa) {
    this.jasa$=jasa;
    if (!kecamatan) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.kotatasikmalaya && kecamatan) {
        if (v.dagang.kotatasikmalaya.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarGarutJasa(kecamatan,jasa) {
    this.jasa$=jasa;
    if (!kecamatan) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.garut && kecamatan) {
        if (v.dagang.garut.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarSumedangJasa(kecamatan,jasa) {
    if (!kecamatan) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.sumedang && kecamatan) {
        if (v.dagang.sumedang.indexOf(kecamatan) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  cariBerdasarKecamatanJasa(kecamatan) {

    if (!kecamatan) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.kecamatan && kecamatan) {
        if (v.dagang.kecamatan.toLowerCase().indexOf(kecamatan.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(kecamatan, this.barang$.length);

  }

  cariBerdasarKabupatenJasa(kabupaten) {

    if (!kabupaten) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.kabupaten && kabupaten) {
        if (v.dagang.kabupaten.toLowerCase().indexOf(kabupaten.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    console.log(kabupaten, this.barang$.length);

  }

  getItemsJasa(searchbar,jasa) {
    // Reset items back to all of the items
   //this.initializeItems();
   //console.log(jasa);
    this.jasa$=jasa;
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;
    

    // if the value is an empty string don't filter the items
    if (!q) {
      return;
    }

    this.jasa$ = this.jasa$.filter((v) => {
      if(v.dagang.namaDagangan && q) {
        if (v.dagang.namaDagangan.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
    //console.log(q, this.jasa$.length);

  }


}