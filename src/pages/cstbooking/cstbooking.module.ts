import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CstbookingPage } from './cstbooking';

@NgModule({
  declarations: [
    CstbookingPage,
  ],
  imports: [
    IonicPageModule.forChild(CstbookingPage),
  ],
})
export class CstbookingPageModule {}
