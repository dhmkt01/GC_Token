import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {CstbookingPage} from '../pages/cstbooking/cstbooking';
import { LoginPage } from '../pages/login/login';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { SettingPage } from '../pages/setting/setting';
import { SMS } from '@ionic-native/sms';
// Import Firebase / environment config and initialise
import { Autostart } from '@ionic-native/autostart';
import * as firebase from 'firebase/app';
import { environment } from '../environments/environment';
import { TokendataProvider } from '../providers/tokendata/tokendata';
import { PreloaderProvider } from '../providers/preloader/preloader';
import { BatteryStatus } from '@ionic-native/battery-status';
import { IonicStorageModule } from '@ionic/storage';

firebase.initializeApp(environment.firebase);


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SettingPage,
    LoginPage,
    CstbookingPage
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SettingPage,
    LoginPage,
    CstbookingPage
  ],
  providers: [
    SMS,
    StatusBar,
    SplashScreen,
    
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    TokendataProvider,
    AndroidPermissions,
    BatteryStatus,
    PreloaderProvider,
    Autostart ,
    IonicStorageModule
  ]
})
export class AppModule {}