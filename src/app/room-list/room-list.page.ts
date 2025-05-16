import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Room } from 'src/app/models/booking.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.page.html',
  styleUrls: ['./room-list.page.scss'],
})
export class RoomListPage implements OnInit {
  rooms$: Observable<Room[]>;

  constructor(private firestore: Firestore, private router: Router) {
    const roomCollection = collection(this.firestore, 'rooms');
    this.rooms$ = collectionData(roomCollection, { idField: 'id' }) as Observable<Room[]>;
  }

  ngOnInit() {}

  goToBooking(roomId: string) {
    this.router.navigate(['/build', roomId]);
  }
}
