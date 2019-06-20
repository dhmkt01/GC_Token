import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Autostart } from '@ionic-native/autostart';
import { Storage } from '@ionic/storage';
import {AlertController} from 'ionic-angular';
import {CstbookingPage} from '../cstbooking/cstbooking';
/**
 * Generated class for the SettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
autostarting :boolean;
  incomingcall: boolean;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private autostart: Autostart,
    private storage: Storage,
    public alertCtrl: AlertController) {


      storage.get('autostart').then((val) => {
        this.autostarting = val;
        
      });
      storage.get('incomingcall').then((val) => {
        this.incomingcall = val;
        
      });
  }
  incomingcallstatus(){
    if(this.incomingcall == true){
      this.storage.set('incomingcall', true);
     
     }else{
      this.storage.set('incomingcall', false);
     
     }
  }
 autostartup(){
   if(this.autostarting == true){
    this.storage.set('autostart', true);
    this.autostart.enable();
   }else{
    this.storage.set('autostart', false);
    this.autostart.disable();
   }
 
 }

gotopage(value): void {
  this.navCtrl.push(CstbookingPage);
}


}
