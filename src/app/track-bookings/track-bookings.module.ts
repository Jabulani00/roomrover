import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrackBookingsPageRoutingModule } from './track-bookings-routing.module';

import { TrackBookingsPage } from './track-bookings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrackBookingsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [TrackBookingsPage]
})
export class TrackBookingsPageModule {}
