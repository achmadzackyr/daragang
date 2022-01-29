import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, LoadingController } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { FilterService } from '../providers/filter';
import { Camera } from '@ionic-native/camera';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Clipboard } from '@ionic-native/clipboard';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { FilterComponent } from '../components/filter/filter';
import { FilterPedagangComponent } from '../components/filter-pedagang/filter-pedagang';
import { NotifikasiComponent } from '../components/notifikasi/notifikasi';
import { SharedModule } from '../app/shared.module';

import { FIREBASE_CONFIG } from '../app/app.firebase.config';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    FilterComponent,
    FilterPedagangComponent,
    NotifikasiComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,
      {
        scrollAssist: false,    // Valid options appear to be [true, false]
        autoFocusAssist: false  // Valid options appear to be ['instant', 'delay', false]
      }
    ),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    IonicImageViewerModule,
    SharedModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    FilterComponent,
    FilterPedagangComponent,
    NotifikasiComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FilterService,
    Camera,
    SocialSharing,
    Clipboard,
    LoadingController,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
