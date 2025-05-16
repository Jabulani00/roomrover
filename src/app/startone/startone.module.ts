import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StartonePageRoutingModule } from './startone-routing.module';

import { StartonePage } from './startone.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StartonePageRoutingModule
  ],
  declarations: [StartonePage]
})
export class StartonePageModule {}
