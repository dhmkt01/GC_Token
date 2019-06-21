import { Injectable, NgZone } from '@angular/core';
import * as firebase from 'firebase/app';
import { BatteryStatus } from '@ionic-native/battery-status';
import * as moment from 'moment';
import 'firebase/auth';
import 'firebase/database'; 
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
declare var SMS: any;
/*
  Generated class for the TokendataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TokendataProvider {
  user: string;
  clinicid: any;
  callwaiting:boolean = true;
  public clinicdetails: any;
  rootpath: firebase.database.Reference;
  currnetpatinetname: any;
  currentpatinetststus: any;
  currqis: firebase.database.DataSnapshot;
  clinicname: string;
  constructor(private batteryStatus: BatteryStatus,private alertCtrl:AlertController,public zone:NgZone, private storage: Storage) {
  
   // console.log('Hello TokendataProvider Provider');
    this.clinicdetails = {};
    firebase.auth().onAuthStateChanged((user) =>
    {
      if (user)
      {
        this.user = user.uid;
      
        
 
        // User is signed in.
      //  console.log('User is signed in');
      }
      else
      {
        // No user is signed in.
       // console.log('User is NOT signed in');
      }
    });










  }
  getbatterstatus(){
   
    const subscription = this.batteryStatus.onChange().subscribe(status => {
      firebase.database().ref('clinicDtl').child(this.clinicid).update({ tabper: status.level,tabstate:status.isPlugged });
    
   });
  }
  getclinid():  Promise<any> { 
    
    return new Promise<any>((resolve, reject) => {
        firebase.database().ref('clinicAdm')
        .child(this.user).child("clinic")
        .on('value', data => {
          this.clinicid = data.val();
          this.getbatterstatus();
          this.getpath();
            resolve(data.exists());
        });
       
    });  
}
getpath(){
  this.storage.get('incomingcall').then((val) => {
    if(val == true){
   
      this.reminderlists();
    }    
    });

  this.rootpath =   firebase.database().ref('clinicDtl').child(this.clinicid)
}
getclinicroot(){
  return this.rootpath;
}
onloadupdate()  :  Promise<any> { 
    
    return new Promise<any>((resolve, reject) => {
      firebase.database().ref('clinicList').child(this.clinicid).child('Misscall').update({ number: "fresh" }).then(function(){
                   resolve(true);
        });
       
    });  
  
}
rootformisscall(){
  return firebase.database().ref('clinicList').child(this.clinicid).child('Misscall');
}
checkmisscalldata(misscallnum):  Promise<any> { 
    
  return new Promise<any>((resolve, reject) => {
      firebase.database().ref('clinicList')
      .child(this.clinicid).child("patientDetail/"+misscallnum)
      .on('value', data => {
                 resolve(data.exists());
      });
     
  });  
}
getmisscallpatientdetails(misscallnum):  Promise<any> { 
    
  return new Promise<any>((resolve, reject) => {
      firebase.database().ref('clinicList')
      .child(this.clinicid).child("patientDetail/"+misscallnum)
      .on('value', data => {
                 resolve(data.val());
      });
     
  });  
}
getnewtoken(misscallnum: any,tokennum: number,data: string,arrival: string) :  Promise<any> { 
  
  if(data == "call"){
    var reginstat =  "Registered";
    var registeras = "images/misscall.png"
  }else if(data == "mobile"){
    var reginstat   = 'Inclinic';
    var registeras = "images/tablet.png"
  }
  var clinicid = this.clinicid;
  var that= this;
  //var tokenNumber = tokennum +1; 
  return new Promise<any>((resolve, reject) => {
 if(that.callwaiting == true){
   that.callwaiting = false;
  firebase.database().ref('clinicList').child(clinicid).child('patientList').push({
    addr: "", 
    completed:false,
    createdAt:new Date().getTime(),
    bookedAt:that.convert24to12( moment().format('HH:mm')),
    mobileNum : misscallnum,
    patientDOB : "",
    patientName : "New",
    patientPostalCode : "",
    patientSex : "",
    patientuid : "",
    regstatus : registeras,
    status : reginstat,
    tokenNumber : tokennum,
    arrivalAt:arrival

   
   }).then((snap) => {
    // firebase.database().ref('clinicList').child(clinicid).child('Misscall').update({ number: "fresh" })
     firebase.database().ref('clinicDtl').child(clinicid).update({ newQ: tokennum });
     that.callwaiting = true;
              resolve(tokennum);
              if(data == "mobile"){
               let alert = that.alertCtrl.create({
                 title: 'Welcome to '+that.clinicname,
                 cssClass:'inputnameclass',
                 inputs: [
                   {
                     name: 'name',
                     placeholder: 'Enter your name',
                     type: 'text',
                   }
                  
                 ],
                 buttons: [
                   {
                     text: 'Later',
                     role: 'cancel',
                     handler: data => {
                      that.showtokennumbervisitor(tokennum,arrival)
                     }
                   },
                   {
                     text: 'Update',
                     handler: data => {
                      that.showtokennumber(data.name,tokennum,arrival);
                       firebase.database().ref('clinicList')
                     .child(clinicid).child("patientList").child(snap.key).update({ patientName : data.name }).then(function(){
                      
                       firebase.database().ref('clinicList')
                       .child(clinicid).child("patientDetail").child(misscallnum).update({ patientFullName : data.name });
                      
                    
                     }).catch(function(error) {
                      // alert("Data could not be saved." + error);
                     });
                    
                     }
                   }
                 ]
               });
               alert.present();
             }
   });

 }
    
      
 





});




 

}
showtokennumber(name,number,arrival) {
  let alert = this.alertCtrl.create({
    title: 'Dear '+name+',',
    subTitle: 'Your token number is <h3>'+number+'</h3> Estimated Consultation time is <h3>'+arrival+'</h3> <h2>Kindly take your seat</h2> Thankyou',
   
    cssClass: 'showtokennumber'
  });
  alert.present();
 
  setTimeout(()=>alert.dismiss(),8000);
}
showtokennumbervisitor(number,arrival) {
  let alert = this.alertCtrl.create({
    title: 'Dear Visitor,',
    subTitle: 'Your token number is <h3>'+number+'</h3> Estimated Consultation time is <h3>'+arrival+'</h3> <h2>Kindly take your seat</h2> Thankyou',
   
    cssClass: 'showtokennumber'
  });
  alert.present();
 
  setTimeout(()=>alert.dismiss(),8000);
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
arrivedupdate(tokenNumber){
  var tokne = Number(tokenNumber) ;
  var clinicid = this.clinicid;
  var that = this;
  firebase.database().ref('clinicList')
  .child(clinicid).child("patientList").orderByChild("tokenNumber").equalTo(tokne)
  .once('value', data => { 
    var details = data.val();
    for (var k in details){
      if (details.hasOwnProperty(k)) {
       
        firebase.database().ref('clinicList')
        .child(clinicid).child("patientList").child(k).update({ status : 'Inclinic' }).then(function(){
          console.log("Data saved.");
          if(details[k].patientName == 'New'){
          }else{
            that.arrivedeupdatemsg(details[k].patientName);
          }
      
        }).catch(function(error) {
         console.log("Data could not be saved." + error);
        });
if(details[k].patientName == 'New'){
  let alert = this.alertCtrl.create({
    title: 'Welcome to'+this.clinicname,
    cssClass:'inputnameclass',
    inputs: [
      {
        name: 'name',
        placeholder: 'Enter your name',
        type: 'text',
      }
     
    ],
    buttons: [
      {
        text: 'Later',
        role: 'cancel',
        handler: data => {
         
        }
      },
      {
        text: 'Update',
        handler: data => {
          firebase.database().ref('clinicList')
        .child(clinicid).child("patientList").child(k).update({ patientName : data.name }).then(function(){
          that.arrivedeupdatemsg(data.name);
        }).catch(function(error) {
         // alert("Data could not be saved." + error);
        });
       
        }
      }
    ]
  });
  alert.present();
}
      }
  }
   
      
  });
}
arrivedeupdatemsg(name){
  let alert = this.alertCtrl.create({
    title: 'Dear '+name,
    subTitle: '<h2>You have sucessfully checked-in.</h2><h2>Kindly take your seat </h2><h2>You will be called once ready </h2><h2>Thankyou</h2>',
    cssClass:'arrivalupdatemsg',
  });
  alert.present();
 setTimeout(()=>alert.dismiss(),8000);
}
checkincomingifexists(misscallnum):  Promise<any> { 
    
  return new Promise<any>((resolve, reject) => {
    var count =0;
    firebase.database().ref('clinicList')
    .child(this.clinicid).child('patientList').orderByChild('mobileNum').equalTo(misscallnum)
    .on('value', data => {
      if(data.exists() == true){
        Object.keys(data.val()).forEach(function (key) {
          count++
           
          });
         
      }else{
       
      }
      resolve(count);  
         
    });
  
});
 
 
  
}

getmisscallesistingdata(misscallnum){
  return new Promise<any>((resolve, reject) => {
  
    firebase.database().ref('clinicList')
    .child(this.clinicid).child('patientList').orderByChild('mobileNum').equalTo(misscallnum)
    .on('value', data => {
    
      resolve(data.val());  
         
    });
  
});
}
getnewtokenwithdata(misscallnum: any,tokennum: number,patientname: any,data: string,arrival: any) :  Promise<any> { 
  if(data == "call"){
    var registeras = "images/misscall.png"
    var restatus = "Registered";
  }else if(data == "mobile"){
    var registeras = "images/tablet.png"
    var restatus = 'Inclinic';
  }
  var __this = this
  var clinicid = this.clinicid;
  var tokenNumber = tokennum +1; 
  return new Promise<any>((resolve, reject) => {
    if(__this.callwaiting == true){
      __this.callwaiting = false;
      firebase.database().ref('clinicList').child(clinicid).child('patientList').push({
        addr: "", 
        completed:false,
        createdAt:new Date().getTime(),
        mobileNum : misscallnum,
        bookedAt:__this.convert24to12(moment().format('HH:mm')),
        patientDOB : "",
        patientName : patientname,
        patientPostalCode : "",
        patientSex : "",
        patientuid : "",
        regstatus :registeras,
        status : restatus,
        tokenNumber : tokennum,
        arrivalAt:arrival
 
       
       }).then(function(){
        // firebase.database().ref('clinicList').child(clinicid).child('Misscall').update({ number: "fresh" })
         firebase.database().ref('clinicDtl').child(clinicid).update({ newQ: tokennum });
         if(data == "mobile"){
          
           __this.showtokennumber(patientname,tokennum,arrival);
         } __this.callwaiting = true;
                  resolve(tokennum);
       });
    }

   
     
  });  

}

getpatientlist(tokenNumber,idata):  Promise<any> { 
  console.log(idata);
  console.log("called to gat patient data");
  var clinc = this.clinicid;
  var that = this;
  return new Promise<any>((resolve, reject) => {
      firebase.database().ref('clinicList')
      .child(clinc).child("patientList").orderByChild("tokenNumber").equalTo(tokenNumber)
      .once('value', data => { 
        firebase.database().ref('clinicDtl')
        .child(this.clinicid).child(idata)
        .on('value', currquid => {  
          that.currqis = currquid;
         if(currquid.val() == tokenNumber){
          var details = data.val();
          for (var k in details){
        
            if (details.hasOwnProperty(k)) {
              firebase.database().ref('clinicList')
              .child(clinc).child('patientList').child(k)
              .once('value', datai => {  
                if(currquid.val() == tokenNumber){
                that.zone.run(() => {
           that.currnetpatinetname =   datai.val().patientName;
           that.currentpatinetststus = datai.val().status;
           console.log(datai.val().status)
                  resolve(datai.val());
      
                })
              }
              });
              
            }
        }
         }else if(currquid.val() == 0 ){
           delete that.currentpatinetststus;
           delete that.currnetpatinetname
         }
           
        });




     
      });        
  
     
  });  
}
  getclinicdetails():  Promise<any> { 
    return new Promise<any>((resolve, reject) => {
        firebase.database().ref('clinicDtl')
        .child(this.clinicid)
        .on('value', data => {  
         
            resolve(data.val());
        });
       
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
updateinout(data){
  this.rootpath.update({inout: data});
}
updateclinic(data){
  this.rootpath.update({clinicopen: data});
}
updatetoken(q){
  this.rootpath.update({currQ: q});
}



clinicopeningtime():  Promise<any> { 
    
  return new Promise<any>((resolve, reject) => {
      firebase.database().ref('clinicDtl')
      .child(this.clinicid)
      .once('value', data => {
        var d = new Date();
        var curday = d.getDay();
     
        let dayKey = { 1: 'm', 2: 't', 3: 'w', 4: 'h', 5: 'f', 6: 's', 0: 'u' };
        let dk = dayKey[curday];
        let opentime = this.isOpen(data.val()[dk + 's1s']);
        if (opentime == 'next') {
          opentime = this.isOpen(data.val()[dk + 's2s']);
        }
        if (opentime == 'next') {
          opentime = this.isOpen(data.val()[dk + 's3s']);
        }
        if (opentime == 'next') {
          opentime = "";
        }


                 resolve(opentime);
      });
     
  });  
}


isOpen(s1) {
  if (s1 !== undefined && s1 !== null) {
    if(s1 == "00:00"){
      return 'next';
    }else{
      return s1;
    }
    
    
   



  }
  else {

  }


}
getcurrentdatecustomformate(){
 return moment().format("DD-MM-YYYY"); 
}
reminderlists(){
  var clinicid = this.clinicid;
  var that = this;
  firebase.database().ref('clinicList')
  .child(clinicid).child('reminderList').child(moment().format("YYYY-MM-DD"))
  .on('value', data => {  
   
   
    data.forEach(function(childSnapshot) {
      var patientmobile = childSnapshot.key;
      firebase.database().ref('clinicList')
  .child(clinicid).child('reminderList').child(moment().format("YYYY-MM-DD")).child(patientmobile)
  .once('value', remindermsg => {
    if(remindermsg.val().status === "SMSRequested"){
     
     that.sendsmsforreminder(patientmobile,remindermsg.val().message);
    } 
    

  });
    })
  });
}
sendsmsforreminder(patientmobile,messagedetails){
  var message  = messagedetails ;
  var that = this
  SMS.sendSMS(patientmobile, message,function(result){
if(result == 'OK'){
  that.updatereminderlists(patientmobile);
  var statusiid = "SENT";
  that.addremindermsgtodtl(patientmobile,messagedetails,statusiid);
}
   
    
   }, function(e){
    var statusiid = "ERROR";
    that.addremindermsgtodtl(patientmobile,messagedetails,statusiid);
     alert('Error sending SMS.'+e); 
   });
}

updatereminderlists(mobilenumber){
  
  firebase.database().ref('clinicList').child(this.clinicid).child('reminderList').child(moment().format("YYYY-MM-DD")).child(mobilenumber).remove();
}
addremindermsgtodtl(patientmobile: any,messagedetails: any,statusiid: string){
  firebase.database().ref('clinicList').child(this.clinicid).
  child('patientDetail').child(patientmobile).
  child("remindermsglist").push({ 
    
    date: moment().format("YYYY-MM-DD"),
    time: this.convert24to12(this.getcurrenttime()),
    message:messagedetails,
    status:statusiid
  
  });
}
}
