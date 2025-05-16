// src/app/services/room.service.ts
import { Injectable } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, addDoc, updateDoc, deleteDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Room } from 'src/app/models/booking.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  
  constructor(private firestore: Firestore) { }
  
  // Get all rooms
  getRooms(): Observable<Room[]> {
    const roomsRef = collection(this.firestore, 'rooms');
    return collectionData(roomsRef, { idField: 'id' }) as Observable<Room[]>;
  }
  
  // Get a single room by ID
  getRoomById(id: string): Observable<Room> {
    const roomRef = doc(this.firestore, `rooms/${id}`);
    return docData(roomRef, { idField: 'id' }) as Observable<Room>;
  }
  
  // Add a new room
  addRoom(room: Room): Promise<any> {
    const roomsRef = collection(this.firestore, 'rooms');
    return addDoc(roomsRef, room);
  }
  
  // Update a room
  updateRoom(room: Room): Promise<void> {
    const roomRef = doc(this.firestore, `rooms/${room.id}`);
    return updateDoc(roomRef, { 
      name: room.name,
      capacity: room.capacity,
      location: room.location,
      amenities: room.amenities,
      imageUrl: room.imageUrl
    });
  }
  
  // Delete a room
  deleteRoom(id: string): Promise<void> {
    const roomRef = doc(this.firestore, `rooms/${id}`);
    return deleteDoc(roomRef);
  }
  
  // Search rooms by location
  searchRoomsByLocation(location: string): Observable<Room[]> {
    const roomsRef = collection(this.firestore, 'rooms');
    const q = query(roomsRef, where('location', '==', location));
    return collectionData(q, { idField: 'id' }) as Observable<Room[]>;
  }
  
  // Filter rooms by capacity
  filterRoomsByCapacity(minCapacity: number): Observable<Room[]> {
    return this.getRooms().pipe(
      map(rooms => rooms.filter(room => room.capacity >= minCapacity))
    );
  }
}