import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Icon } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AndroidPermissions } from '@ionic-native/android-permissions';// Import page components and authentication provider
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { AuthProvider } from '../providers/auth/auth';
import { SettingPage } from '../pages/setting/setting';

declare var window:any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
   @ViewChild(Nav) nav: Nav;


   /**
    * Set the root page for the application
    */
   public rootPage: any = HomePage;



   /**
    * Define the pages for the application
    */
   private pages: Array<{title: string, component: any,icon :string}>;



   constructor(public platform      : Platform,
               public statusBar     : StatusBar,
               public splashScreen  : SplashScreen,
               private _AUTH        : AuthProvider,
               public androidPermissions:AndroidPermissions)
   {
      this.initializeApp();


      // Populate pages for the application
      this.pages = [
        { title: 'Token Screen', component: HomePage ,icon:'home'},
       { title: 'Setting', component: SettingPage ,icon:'settings' },
        { title: 'Logout', component: LoginPage, icon:'log-out' }
      ];
   }




   /**
    * Initialise the application
    * @method initializeApp
    * return {none}
    */
   initializeApp() : void
   {
      this.platform
      .ready()
      .then(() =>
      {
         // Okay, so the platform is ready and our plugins are available.
         // Here you can do any higher level native things you might need.
        
         this.statusBar.hide();
       this.splashScreen.hide();
      
       let isApp = (!document.URL.startsWith('http') || document.URL.startsWith('http://localhost:8080'));
       if (isApp){
         window.plugins.insomnia.keepAwake()
         this.requestSMSPermissions();
       } 
     
      });
   }




   /**
    * Open a page from the sidemenu
    * @method openPage
    * @param page   {object}      The name of the page component to open
    * return {none}
    */
   openPage(page : any) : void
   {
      // Ensure we can log out of Firebase and reset the root page
      if(page == 'Logout')
      {
         this._AUTH.logOut()
         .then((data : any) =>
         {
            this.nav.setRoot(page.component);
         })
         .catch((error : any) =>
         {
            console.dir(error);
         });
      }

      // Otherwise reset the content nav to have just this page
      // we wouldn't want the back button to show in this scenario
      else
      {
         this.nav.setRoot(page.component);
      }
   }
  
    requestSMSPermissions() {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(
         result => console.log('Has permission?'+result.hasPermission),
         err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS)
       );
       
       this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.SEND_SMS]).then(() => {
         this.requestPhonePermissions();
      }).catch((err) => {
        console.log(JSON.stringify(err));
    });
   
 }
 requestPhonePermissions(){
   this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(() => {
         
   }).catch((err) => {
      console.log(JSON.stringify(err));
 });
 }

}