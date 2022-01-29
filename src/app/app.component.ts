import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController, LoadingController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';

import { HomePage } from '../pages/home/home';
import { User } from '../models/user';

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  index?: number;
  tabName?: string;
  tabComponent?: any;
  logsOut?: boolean;
  active?: boolean;
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  MENU = {
    DEFAULT: 'menu-off',
    MATERIAL: 'menu-material'
  };

  // email;
  uid;
  // loggedIn = false;
  profileData: Observable<any>;
  placeholder = 'assets/imgs/background/avatar-default.png';
  chosenPicture: any;
  loading;
  user = {} as User;
  jumlah=Object();

  imah : PageInterface[] = [
      { title: 'Home', component: 'TabsPage', icon: 'home', name: 'TabsPage', tabComponent: HomePage, index: 0 }
    ];


  //pages: Array<{ title: string, component: any, active: boolean, icon: string, name: string, index?: number, tabComponent?: any }>;
    loggedOutPages : PageInterface[] = [
      { title: 'Home', component: 'TabsPage', icon: 'home', name: 'TabsPage', tabComponent: HomePage, index: 0 },
      { title: 'Login / Daftar', component: 'LoginPage', icon: 'log-in', name: 'LoginPage' }
    ];

  // used for an example of ngFor and navigation
    pages : PageInterface[] = [
      { title: 'Makanan', component: 'MakananPage', icon: 'pizza', name: 'MakananPage'},
      { title: 'Barang', component: 'BarangPage', icon: 'cube', name: 'BarangPage' },
      { title: 'Jasa', component: 'JasaPage', icon: 'build',name: 'JasaPage' },
      { title: 'Pedagang', component: 'PedagangPage', icon: 'contacts',name: 'PedagangPage' }
    ];

  loggedInPages: PageInterface[] = [
    { title: 'Home', component: 'TabsPage', icon: 'home', name: 'TabsPage', tabComponent: HomePage, index: 0 },
    { title: 'Disukai', component: 'TabsPage', icon: 'heart', name: 'TabsPage', tabComponent: 'DisukaiPage', index: 1 },
    { title: 'Profil', component: 'TabsPage', icon: 'person', name: 'TabsPage', tabComponent: 'ProfilPage', index: 2 },
    { title: 'Notifikasi', component: 'NotifikasiPage', icon: 'notifications', name: 'NotifikasiPage'},
    { title: 'TambahDagangan', name: 'TambahDaganganPage', component: 'TambahDaganganPage', icon: 'add-circle'},
    { title: 'Logout', name: 'TabsPage', component: 'TabsPage', icon: 'log-out', logsOut: true }
  ];

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private afAuth: AngularFireAuth,
    private afDbase: AngularFireDatabase, public menuCtrl: MenuController, public loadingCtrl: LoadingController) {
    this.jumlah.like=0;
    this.jumlah.komentar=0;
    this.jumlah.ulasan=0;

    this.cekLogin();
    this.initializeApp();
  }
  
  enableAuthenticatedMenu() {
    this.menuCtrl.enable(true, 'menu-material');
    this.menuCtrl.enable(false, 'menu-off');
  }

  disbaleAuthenticatedMenu() {
    this.menuCtrl.enable(true, 'menu-off');
    this.menuCtrl.enable(false, 'menu-material');
  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNavs()[0];

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'true';
      }
      return;
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'true';
    }
    return;
  }

  async cekLogin() {
    try {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.rootPage = "TabsPage";
          // User is signed in.
          //this.email = user.email;
          this.uid = user.uid;
          this.profileData = this.afDbase.object(`user/${this.uid}`).valueChanges();
          this.enableAuthenticatedMenu();
          this.hitungNotif(this.uid);
        } else {
        // User is signed out.
        // ...
        this.rootPage = "TabsPage";
        this.disbaleAuthenticatedMenu();
        }
      });
    } catch (e) {
      console.error(e);
    }
  }



  initializeApp() {
    this.platform.ready().then(() => {   
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  changeMenu(menu) {
    // Disables all other sidemenus
    Object.keys(this.MENU).map(k => this.menuCtrl.enable(false, this.MENU[k]));

    // Enables then open the selected menu
    this.menuCtrl.enable(true, menu);
    this.menuCtrl.open(menu);
  }

  openPage(page: PageInterface) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    let params = {};

    // the nav component was found using @ViewChild(Nav)
    // setRoot on the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      params = { tabIndex: page.index };
    }

        // If we are already on tabs just change the selected tab
    // don't setRoot again, this maintains the history stack of the
    // tabs even if changing them from the menu
    if (this.nav.getActiveChildNavs().length && page.index != undefined) {
      this.nav.getActiveChildNavs()[0].select(page.index);
    } else {
      // Set the root of the nav with params if it's a tab index
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }

    if (page.logsOut === true) {
      // Give the menu time to close before changing to logged out
      this.logout();
    }

  }

  login() {
    this.nav.setRoot('LoginPage');
  }

  home() {
    this.nav.setRoot(HomePage);
  }

  profil() {
    this.nav.setRoot('ProfilPage');
  }

  tambahDagangan() {
    this.nav.setRoot('TambahDaganganPage');
  }

  logout() {
    return new Promise((resolve) => {
      this.afAuth.auth.signOut();
      resolve(true);
    }).then((x) => {
        this.nav.setRoot("TabsPage", { keluar : true });
        //this.profileData = undefined;
    });
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
