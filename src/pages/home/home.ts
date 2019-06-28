import { Component ,NgZone} from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { TokendataProvider } from '../../providers/tokendata/tokendata';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { LoginPage } from '../login/login';
import { MenuController } from 'ionic-angular';
import { PreloaderProvider } from '../../providers/preloader/preloader';
import {Http, Headers} from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
declare var SMS: any;
import * as moment from 'moment';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';

declare var window:any;
declare var PhoneCallTrap:any;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  public clinicdetails: any;
  doctorinout: any;
  doctorName: any;
  clinicName: any;
  cliniclogo: any;
  Qualifications: any;
  mobile: any;
  currq: any;
  currqlength: number;
  hidediv: boolean = true;
  data:any = {};
  apiurl: string;
  playnowsound:boolean= false;
  playnextsound:boolean=false;
  playcallsound:boolean=false;
  misscallnumber: any;
  misscallnum: any;
  onloadid :boolean = true;
  newnumer: any;
  esttime: any;
  callingnumber: any;
  currentpatientname: any;
  clinicopen: boolean;
  clinicopenstatus: string;
  estdoctime: any;
  date: Date;
  currenttime: string;
  clinicopeningtime: any;
  estdocdate: any;
  currentpatientstatus: any;
  nextq: any;
  clinicalerton:boolean;
  clinicalert: any;
  estimatedtime: number;
  emergtime: any;
  constructor(public navCtrl: NavController,
    private _AUTH     : AuthProvider,
    private tokendata :TokendataProvider,
    private zone: NgZone,
    private menu:MenuController,
    private _LOADER      : PreloaderProvider,
    private storage: Storage,
    public http: HttpClient,
    public alertCtrl:AlertController
    ) {
      this.clinicdetails = {};
      this.onAuthCallback = this.onAuthCallback.bind(this);
      this.mobile = "+91";
      this.data.response = '';
 
this.apiurl =  'https://api.goclinic.sg/miss.php';

this.date = new Date();


this.currenttime=     moment().format('HH:mm');






  }
  ionViewWillEnter() {
   
    this._LOADER.displayPreloader();
    firebase.auth().onAuthStateChanged(this.onAuthCallback);
   
}


  logot(){
    this._AUTH.logOut()
    .then((data : any) =>
    {
      
    })
    .catch((error : any) =>
    {
       console.dir(error);
    });
  }
  onAuthCallback(user) {
    if (!user) {
      this._LOADER.hidePreloader();
      this.navCtrl.push(LoginPage);
      
        
    } else {
      this.getclinicid();
     
        return;
    }    
}
getclinicid(){
  
  this.tokendata.getclinid().then((result: any) => {
    if (result) {
      this._LOADER.hidePreloader();
      this.getclinicdetails();
      this.clinicopening();
      this.getnexttoken();
    
    

      this.acceptincoming();

    
    }
 })
}
acceptincoming(){

  this.storage.get('incomingcall').then((val) => {
  if(val == true){
    this.gotorining();
  }    
  });
 
}
checkin(){
  let alert = this.alertCtrl.create({
    title: 'Please Enter Your Token Number',
   
    cssClass:'arrivalcheckinclass',
    inputs: [
      {
        name: 'token',
        placeholder: 'Input Token Number',
        type: 'number',
      }
     
    ],
    buttons: [
      {
        text: 'Skip',
        role: 'cancel',
        handler: data => {
         // console.log('Cancel clicked');
        }
      },
      {
        text: 'CheckIN',
        handler: data => {
          if(data.token <= this.newnumer){
            this.tokendata.arrivedupdate(data.token);
          }else{
           this.checkinerror();
          }
         
       
        }
      }
    ]
  });
  alert.present();
}
checkinerror(){
  let alert = this.alertCtrl.create({
    title: 'Please enter valid token number',
    cssClass:'arrivalcheckinclass',
    inputs: [
      {
        name: 'token',
        placeholder: 'Input Token Number',
        type: 'number',
      }
     
    ],
    buttons: [
      {
        text: 'Skip',
        role: 'cancel',
        handler: data => {
         // console.log('Cancel clicked');
        }
      },
      {
        text: 'CheckIN',
        handler: data => {
          if(data.token <= this.newnumer){
            this.tokendata.arrivedupdate(data.token);
          }else{
            this.checkinerror();
          }
         
       
        }
      }
    ]
  });
  alert.present();
}
gotorining(){
  var that = this;
  
  if (window.PhoneCallTrap) {
    PhoneCallTrap.onCall(function(obj) {
      var callObj = JSON.parse(obj),
      state = callObj.state,
      callingNumber = callObj.incomingNumber;
    
   if(state == "RINGING"){
     
     that.callingnumber = callingNumber
     that.storage.get('incomingcall').then((val) => {
      if(val == true){
     
       that.incomingnumber();
      }    
      });
     
   }
     
    });
  }
}

sendexistsms(misscallnum){
  var _this =this;
  _this.tokendata.getmisscallesistingdata(misscallnum).then((result: any) =>{
    Object.keys(result).forEach(function (key) {

if(result[key].regstatus == 'images/misscall.png' || result[key].regstatus == 'images/tablet.png'){
  _this.sendsmsforexist(result[key].arrivalAt,misscallnum,result[key].tokenNumber)
}
    });

 
   
  });
}
sendsmsforexist(est,misscallnum,number){
  var misn = est;
  var message  = "Hi,you have already registered with "+this.clinicName.substring(0,20)+", Your token number is "+number+".Book thru App next time for live status and more is.gd/goclinic" ;
  SMS.sendSMS(misscallnum, message,function(result){

   if(result){
  
   }
    
  }, function(e){
     alert('Error sending SMS.'+e); 
   });
}
incomingnumber(){
  this.tokendata.checkincomingifexists(this.callingnumber.substring(3)).then((result: any) =>{
    if(result == 0){
      this.step1(this.callingnumber.substring(3),"call");
      //this.checkpatientdata(this.callingnumber.substring(3),"call");
    }else{
     // this.sendexistsms(this.callingnumber.substring(3));
    }
   });
  

}

public updateclinic(open){
if(open == false){
  this.tokendata.updateclinic(true);
}else if(open ==true){
  this.tokendata.updateclinic(false);
}
 
} 
getclinicdetails(){
  this.getlivetoken();
  
  this.callsound();
  this.tokendata.getclinicroot().on('value', data => {      
   // console.log("clinic name"+data.val().clinicName)  ; 
    this.zone.run(() => {
      this.clinicName = data.val().clinicName;
      this.tokendata.clinicname =data.val().clinicName;
      this.doctorName = data.val().doctorName;
      this.doctorinout = data.val().inout;
      this.cliniclogo = data.val().clniclogo;
      this.Qualifications = data.val().Qualifications;
      this.newnumer = data.val().newQ;
      this.esttime  = data.val().esttime;
      this.clinicopen = data.val().clinicopen;
      this.estdoctime = data.val().estdoctime;
      this.estdocdate = data.val().estdocdate;
      this.emergtime = data.val().emergtime;
      if(data.val().estimatedtime == undefined || data.val().estimatedtime == null){
        this.estimatedtime = 0;
      }else{
        this.estimatedtime = data.val().estimatedtime;
      }
     
     
//alert(moment(this.estimatedtime).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'));
      if(data.val().clinicalerton == null || data.val().clinicalerton == undefined){
        this.clinicalerton = false;
      }else{
        this.clinicalerton = data.val().clinicalerton;
      }
      
      this.clinicalert = data.val().clinicalert;
   
       if(this.clinicopen == true){
  this.clinicopenstatus = "Clinic Open";
      }else if(this.clinicopen == false){
        this.clinicopenstatus = "Clinic Closed";
            }
    //  this.currq  = data.val().currQ;
      this.misscallnumber = data.val().misscallnumber;
      this.currqlength = data.val().currQ.toString().length;
    //  this.playmusic();
  });
    
});
}
callsound(){
  this.tokendata.getclinicroot().child('callsound').on('value', data => {      
    // console.log("clinic name"+data.val().clinicName)  ; 
     this.zone.run(() => {
       if(this.playcallsound !== false){
         this.playmusic();
       }
      
       this.playcallsound = true
       
   });
     
 });
}
getlivetoken(){
  var idata = 'currQ';
  this.tokendata.getclinicroot().child('currQ').on('value', data => {      
   // console.log("clinic name"+data.val().clinicName)  ; 
    this.zone.run(() => {
      if(this.playnowsound !== false){
        this.playmusic();
      }
      this.currq  = data.val();
      this.getpatientlist(data.val(),idata);
      this.playnowsound = true
      
  });
    
});
}
getnexttoken(){
var idata = 'nextQ';
  this.tokendata.getclinicroot().child('nextQ').on('value', data => {      
    console.log("clinic name"+data.val())  ; 
   
    this.zone.run(() => {
      if(this.playnextsound !== false){
        this.playnext();
        this.currq  = data.val();
        this.nextq = data.val();
        this.getpatientlist(data.val(),idata);
      }
    
     
      this.playnextsound = true
  });
    
});
}

step1(misscallnum,data){
if(this.clinicopen == true){
  this.step2(misscallnum,data);
}else{
  this.clinicclosedmessage(misscallnum);
}
}

step2(misscallnum,data){
        if(this.doctorinout == 1){
    this.inbooking(misscallnum,data);
  }else if(this.doctorinout == 2){
    this.outbooking(misscallnum,data)
  }else if(this.doctorinout == 3){
    this.osbooking(misscallnum,data);
  }else if(this.doctorinout == 4){
    this.inbooking(misscallnum,data);
  }else if(this.doctorinout == 5){
    this.emergbooking(misscallnum,data);
  }else if(this.doctorinout == 6){
    this.inbooking(misscallnum,data);
  }else if(this.doctorinout == 7){
    this.inbooking(misscallnum,data);
  }

}

inbooking(misscallnum,data){
var number = this.newnumer+1
  if(this.estimatedtime == 0){
    var mins = 0;
    this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),mins),moment().format('YYYY-MM-DD HH:mm'),number);
  }else{

    var currenttime = moment(moment().format('YYYY-MM-DD HH:mm')).format('HH:mm');
    var estimated = moment(this.estimatedtime).format('HH:mm');
    if(moment(this.estimatedtime).format('YYYY-MM-DD') == moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
    
      if(currenttime < estimated){
               
        this.step3(misscallnum,data,this.addminsintime(moment(this.estimatedtime).format('HH:mm'),this.esttime),moment(this.estimatedtime).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
         }else{
        this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),this.esttime),moment(moment().format('YYYY-MM-DD HH:mm')).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
         }
      
      
        }else if(moment(this.estimatedtime).format('YYYY-MM-DD') < moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
          this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),this.esttime),moment(moment().format('YYYY-MM-DD HH:mm')).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
        }else if(moment(this.estimatedtime).format('YYYY-MM-DD') > moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
          this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),this.esttime),moment(moment().format('YYYY-MM-DD HH:mm')).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
        }






           
  }
 
}
outbooking(misscallnum: any,data: any){
  var number = this.newnumer+1
  
 if(this.estimatedtime == 0){
  var mins = 0;
  var currenttime = moment(moment().format('YYYY-MM-DD HH:mm')).format('HH:mm');
  var estimated = moment(this.estdoctime).format('HH:mm');
  if(moment(moment().format(this.estdoctime)).format('YYYY-MM-DD') == moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
    
if(currenttime < estimated){
               
    this.step3(misscallnum,data,this.addminsintime(moment(this.estdoctime).format('HH:mm'),mins),moment(this.estdoctime).add(mins, 'm').format('YYYY-MM-DD HH:mm'),number); 
     }else{
    this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),mins),moment(moment().format('YYYY-MM-DD HH:mm')).add(mins, 'm').format('YYYY-MM-DD HH:mm'),number); 
     }


  }else if(moment(moment().format(this.estdoctime)).format('YYYY-MM-DD') < moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
    this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),mins),moment(moment().format('YYYY-MM-DD HH:mm')).add(mins, 'm').format('YYYY-MM-DD HH:mm'),number); 

  }else if(moment(moment().format(this.estdoctime)).format('YYYY-MM-DD') > moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
    this.step3(misscallnum,data,this.addminsintime(moment(this.estdoctime).format('HH:mm'),mins),moment(this.estdoctime).add(mins, 'm').format('YYYY-MM-DD HH:mm'),number); 
  }

  


 }else{

  var currenttime = moment(moment().format('YYYY-MM-DD HH:mm')).format('HH:mm');
  var estimated = moment(this.estdoctime).format('HH:mm');
  var estimatedtime = moment(this.estimatedtime).format('HH:mm');


  if(moment(moment().format(this.estdoctime)).format('YYYY-MM-DD') == moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
    // today
    
if(currenttime>estimated && currenttime>estimatedtime)
  {
    this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),this.esttime),moment(moment().format('YYYY-MM-DD HH:mm')).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
  //alert("current time is bigger");
  }
  else if(estimated>currenttime && estimated>estimatedtime)
  {
    this.step3(misscallnum,data,this.addminsintime(moment(this.estdoctime).format('HH:mm'),this.esttime),moment(this.estdoctime).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
   // alert("estimated doc is bigger");
  }
  else if(estimatedtime>currenttime && estimatedtime>currenttime)
  {
    this.step3(misscallnum,data,this.addminsintime(moment(this.estimatedtime).format('HH:mm'),this.esttime),moment(this.estimatedtime).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
   // alert("estimatedtime is bigger");
  }


   // if(currenttime < estimatedtime){
               
     // this.step3(misscallnum,data,this.addminsintime(moment(this.estimatedtime).format('HH:mm'),this.esttime),moment(this.estimatedtime).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
      // }else{
      //this.step3(misscallnum,data,this.addminsintime(moment().format('HH:mm'),this.esttime),moment(moment().format('YYYY-MM-DD HH:mm')).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
      // }
    
    
      }else if(moment(moment().format(this.estdoctime)).format('YYYY-MM-DD') < moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
    //yesterday  


    this.step3(misscallnum,data,this.addminsintime(moment(this.estimatedtime).format('HH:mm'),this.esttime),moment(this.estimatedtime).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 
      }else if(moment(moment().format(this.estdoctime)).format('YYYY-MM-DD') > moment(moment().format('YYYY-MM-DD HH:mm')).format('YYYY-MM-DD')){
     //tomorrow

     this.step3(misscallnum,data,this.addminsintime(moment(this.estimatedtime).format('HH:mm'),this.esttime),moment(this.estimatedtime).add(this.esttime, 'm').format('YYYY-MM-DD HH:mm'),number); 

      }

  


















  
 }
}
osbooking(misscallnum,data){
  this.sendestdate(misscallnum);
}
emergbooking(misscallnum,data){

  var number = this.newnumer+1
  if(number == 1){
    var mins:any = 0;
  }else{
    var mins:any = this.esttime;
  }
  var emergtime = moment(this.emergtime).format('HH:mm');
  var estimatedtime = moment(this.estimatedtime).format('HH:mm');
    
if(emergtime > estimatedtime){
               
    this.step3(misscallnum,data,this.addminsintime(moment(this.emergtime).format('HH:mm'),mins),moment(this.emergtime).add(mins, 'm').format('YYYY-MM-DD HH:mm'),number); 
     }else{
    this.step3(misscallnum,data,this.addminsintime(moment(this.estimatedtime).format('HH:mm'),mins),moment(this.estimatedtime).add(mins, 'm').format('YYYY-MM-DD HH:mm'),number); 
     }




  this.step3(misscallnum,data,this.addminsintime(moment(this.emergtime).format('HH:mm'),mins),moment(this.emergtime).add(mins, 'm').format('YYYY-MM-DD HH:mm'),number); 
}
step3(misscallnum,data,apptime,estimatedtime,number){
  this.tokendata.checkmisscalldata(misscallnum).then((result: any) => {
    if (result){
    this.step4(misscallnum,data,apptime,estimatedtime,number);
    }else{
    this.tokenbooking(misscallnum,data,apptime,estimatedtime,number); 
    }
  });
}
tokenbooking(misscallnum,data,apptime,estimatedtime,number){
  var this_ = this;
  var misn = apptime;
  var datesend = moment(moment(estimatedtime).format('YYYY-MM-DD HH:mm')).calendar();

if(this_.clinicalerton == true){
  if(this_.clinicalert.length < 75){
    var sendsecondsms = false;
    var message = this_.clinicalert+", Your token "+number+" Appt time "+datesend+" .For more details is.gd/goclinic"
  }else{
    var sendsecondsms = true;
    var message =  this_.clinicName.substring(0,19)+", Your token is"+number+" Appt time "+datesend+".for more details is.gd/goclinic" ;
  }
}else{
  var sendsecondsms = false;
  var message = this_.clinicName.substring(0,19)+", Your token is"+number+" Appt time "+datesend+".for more details is.gd/goclinic" ;
}



  
  this.tokendata.getnewtoken(misscallnum,number,data,apptime,estimatedtime).then((result: any) => {
    if (result) {
if(sendsecondsms == true){
  var clinicaartmsg = this.clinicalert.substring(0,150)
  SMS.sendSMS(misscallnum, clinicaartmsg,function(result){
  
    if(result == 'OK'){
      SMS.sendSMS(misscallnum, message,function(result){
        if(result == 'OK'){
         
         }
        
      }, function(e){
         alert('Error sending SMS.'+e); 
      });
    }
     
   }, function(e){
      alert('Error sending SMS.'+e); 
    });
}else{
  SMS.sendSMS(misscallnum, message,function(result){
    if(result == 'OK'){
     
     }
    
  }, function(e){
     alert('Error sending SMS.'+e); 
  });
}


    }else{
      
   }
  })
}
tokenbookingwithname(misscallnum,data,apptime,estimatedtime,number,patientname){
  var this_ = this;
  var misn = apptime;

var datesend = moment(moment(estimatedtime).format('YYYY-MM-DD HH:mm')).calendar();
if(this_.clinicalerton == true){
  if(this_.clinicalert.length < 75){
    var sendsecondsms = false;
    var message = this_.clinicalert+", Your token "+number+" Appt time "+datesend+" .For more details is.gd/goclinic"
  }else{
    var sendsecondsms = true;
    var message =  this_.clinicName.substring(0,19)+", Your token is"+number+" Appt time "+datesend+".for more details is.gd/goclinic" ;
  }
}else{
  var sendsecondsms = false;
  var message = this_.clinicName.substring(0,19)+", Your token is"+number+" Appt time "+datesend+".for more details is.gd/goclinic" ;
}





  
  this.tokendata.getnewtokenwithdata(misscallnum,number,patientname,data,apptime,estimatedtime).then((result: any) => {
    if (result) {
      if(sendsecondsms == true){
        var clinicaartmsg = this.clinicalert.substring(0,150)
        SMS.sendSMS(misscallnum, clinicaartmsg,function(result){
        
          if(result == 'OK'){
            SMS.sendSMS(misscallnum, message,function(result){
              if(result == 'OK'){
               
               }
              
            }, function(e){
               alert('Error sending SMS.'+e); 
            });
          }
           
         }, function(e){
            alert('Error sending SMS.'+e); 
          });
      }else{
        SMS.sendSMS(misscallnum, message,function(result){
          if(result == 'OK'){
           
           }
          
        }, function(e){
           alert('Error sending SMS.'+e); 
        });
      }
      

   }else{
  
  }
  })
}
step4(misscallnum,data,apptime,estimatedtime,number){
  this.tokendata.getmisscallpatientdetails(misscallnum).then((result: any) => {
    if (result) {
      if(result.patientFullName !== undefined && result.patientFullName !==null){
        this.tokenbookingwithname(misscallnum,data,apptime,estimatedtime,number,result.patientFullName)
        }else{
        this.tokenbooking(misscallnum,data,apptime,estimatedtime,number); 
       } 
    }else{
    }
  })
}



getnewtokenwithdata(data,misscallnum,patientname,arrival,nymber){
  //stoped this funcation
 // this.tokendata.getnewtokenwithdata(misscallnum,nymber,patientname,data,arrival).then((result: any) => {
   // if (result) {
   //   this.sendmsmwithnameestmin(nymber,misscallnum,arrival,patientname);
      
   // this.sendmessagewithname(result,misscallnum,patientname)
  //this.misscallsmswithname(result,misscallnum,patientname);
    
  //  }else{
      
  // }
  //})
}
getnewtoken(number: number,misscallnum: any,data: any,arrival: string){
  // stopped this function
  //this.tokendata.getnewtoken(misscallnum,number,data,arrival).then((result: any) => {
  //  if (result) {
  //    this.sendmsmwithestmin(result,misscallnum,arrival);
      
  //this.misscallsms(result,misscallnum);
  // this.sendmessage(result,misscallnum); 
  //  }else{
      
  // }
  //})
}

sendclinicalert(misscallnum){
  var message = this.clinicalert.substring(0,150)
  SMS.sendSMS(misscallnum, message,function(result){
  
    if(result){
     
    }
     
   }, function(e){
      alert('Error sending SMS.'+e); 
    });
}

getpatientlist(tokenNumber,idata){
  this.tokendata.getpatientlist(tokenNumber,idata).then((result: any) => {
    if (result) {
      this.zone.run(() => {
   //   Object.keys(result).forEach(function (key) {
    this.currentpatientname = result.patientName;
    this.currentpatientstatus = result.status;
    console.log("result.status"+result.status);
       
    //  });
  
      });
    }else{
      
   }
  }) 

}
updateinout(inout){
  if(inout == 1){
    var data = 2;
    this.tokendata.updateinout(data);
  }else if(inout == 2){
    var data = 3;
    this.tokendata.updateinout(data);
  }else if(inout == 3){
    var data = 1;
    this.tokendata.updateinout(data);
  }
}
addnum(val){
  var leng = this.mobile.length
  if(leng !>12){

  }else{
    this.mobile = this.mobile+val;
  }

}
removenum(){
if(this.mobile == "+91"){

}else{
  this.mobile = this.mobile.substr(0, this.mobile.length-1);
}
 
}
prev(){
  var q = --this.currq;
  this.tokendata.updatetoken(q);
}
next(){
  var q =this.currq+1;
  this.tokendata.updatetoken(q);
}

getq(){
 
  var leng = this.mobile.length
  if(leng !>12){
    
    this.misscallnum  =  this.mobile.substring(3);
      
       // this.checkpatientdata(this.misscallnum);
       this.step1(this.misscallnum,"mobile");
  //  this.checkpatientdata(this.misscallnum,"mobile");
    setTimeout(() => {
      this.mobile = "+91";
      this.hivedivon();
  }, 8000);
   // setTimeout(function(){ this.hivedivon();}, 5000);
    this.hidediv = false;



  }else{
    alert("Please check your Number");
    
  }

 
}
hivedivon(){
  this.hidediv = true;
}

playmusic(){
  var audio = new Audio();
  audio.src = "https://admin.goclinic.sg/sound/sound.mp3";
  audio.load();
  audio.play();
}
playnext(){
  var audio = new Audio();
  audio.src = "https://admin.goclinic.sg/sound/next.mp3";
  audio.load();
  audio.play();
}
sendestdate(misscallnum){
  
    var date =moment(this.estdocdate).format('MMMM Do YYYY, h:mm a');
  var message  = this.clinicName.substring(0,22) +" is Closed, Please give misscall again at "+date+". For more details is.gd/goclinic" ;
  SMS.sendSMS(misscallnum, message,function(result){

   if(result){
  
 }
    
 }, function(e){
    alert('Error sending SMS.'+e); 
  });

}


clinicclosedmessage(misscallnum){
  var message  = this.clinicName.substring(0,22) +" is Closed or Not Accepting New Token, Please give misscall at "+this.formatAMPM(this.clinicopeningtime)+".For more details is.gd/goclinic" ;
  SMS.sendSMS(misscallnum, message,function(result){

    if(result){
  
   }
    
   }, function(e){
     alert('Error sending SMS.'+e); 
  });
}

sendmsmwithestmin(number,misscallnum,est){
  var this_ = this;
  var misn = est;
  var message  = "Thanks for reg with "+this_.clinicName.substring(0,20)+", Your token is "+number+" est visiting time "+misn+".Book thru App next time for live status and more is.gd/goclinic" ;
  SMS.sendSMS(misscallnum, message,function(result){
 
    if(result == 'OK'){
    if(this_.clinicalerton == true){
      this_.sendclinicalert(misscallnum);
     }
   }
    
  }, function(e){
     alert('Error sending SMS.'+e); 
   });
  
}


getcurrenttime(){
  var now = new Date();
var pretty = [
 
  now.getHours(),
  ':',
  now.getMinutes(),
  
].join('');
return pretty;
}
addminsintime(time,addextra){
  
  var d1 = new Date (),
 
  d2 = new Date ( d1 );
  var times = [ 0, 0 ]
  var max = times.length

  var a = (time).split(':')
 

  // normalize time values
  for (var i = 0; i < max; i++) {
    a[i] = isNaN(parseInt(a[i])) ? 0 : parseInt(a[i])
   
  }
  for (var i = 0; i < max; i++) {
    times[i] = a[i]
  }
d2.setHours ( times[0]);
d2.setMinutes ( times[1] + addextra);

return  moment(d2).utcOffset("+05:30").format('LT');;
}
estimatereturn(minadd){
  var d1 = new Date (),
 
  d2 = new Date ( d1 );
d2.setMinutes ( d1.getMinutes() + minadd );
 return this.convert24to12(d2.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) )
}
convert24to12 (time) {
 
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { 
    time = time.slice (1);  
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; 
    time[0] = +time[0] % 12 || 12; 
  }
  return time.join (''); 
}
formatAMPM(time) {
  var d1 = new Date (),
 
  d2 = new Date ( d1 );
  var times = [ 0, 0 ]
  var max = times.length
  var a = (time).split(':')
  for (var i = 0; i < max; i++) {
    a[i] = isNaN(parseInt(a[i])) ? 0 : parseInt(a[i])
   
  }
  for (var i = 0; i < max; i++) {
    times[i] = a[i]
  }
  d2.setHours ( times[0]);
d2.setMinutes ( times[1]);

var amOrPm = (d2.getHours() < 12) ? "AM" : "PM";

return  time + amOrPm;
}
clinicopening(){
  this.tokendata.clinicopeningtime().then((result: any) => {
    this.clinicopeningtime =result;
     
    });
}

}
