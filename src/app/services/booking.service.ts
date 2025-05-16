// src/app/services/booking.service.ts
import { Injectable } from '@angular/core';
import { 
  collection, collectionData, doc, docData, Firestore, 
  addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Booking } from 'src/app/models/booking.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  
  constructor(private firestore: Firestore) { }
  
  // Get all bookings
  getBookings(): Observable<Booking[]> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const q = query(bookingsRef, orderBy('startTime', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(bookings => this.convertTimestamps(bookings as Booking[]))
    );
  }
  
  // Get bookings for a specific room
  getBookingsByRoom(roomId: string): Observable<Booking[]> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const q = query(
      bookingsRef, 
      where('roomId', '==', roomId),
      orderBy('startTime', 'asc')
    );
    return collectionData(q, { idField: 'id' }).pipe(
      map(bookings => this.convertTimestamps(bookings as Booking[]))
    );
  }
  
  // Get bookings for a specific user
  getBookingsByUser(userId: string): Observable<Booking[]> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const q = query(
      bookingsRef, 
      where('userId', '==', userId),
      orderBy('startTime', 'asc')
    );
    return collectionData(q, { idField: 'id' }).pipe(
      map(bookings => this.convertTimestamps(bookings as Booking[]))
    );
  }
  
  // Get a single booking by ID
  getBookingById(id: string): Observable<Booking> {
    const bookingRef = doc(this.firestore, `bookings/${id}`);
    return docData(bookingRef, { idField: 'id' }).pipe(
      map(booking => this.convertTimestamp(booking as Booking))
    );
  }
  
  // Add a new booking
  addBooking(booking: Booking): Promise<any> {
    const bookingsRef = collection(this.firestore, 'bookings');
    
    // Convert Date objects to Firestore Timestamps
    const bookingToSave = {
      ...booking,
      startTime: Timestamp.fromDate(new Date(booking.startTime)),
      endTime: Timestamp.fromDate(new Date(booking.endTime)),
      createdAt: Timestamp.fromDate(new Date())
    };
    
    return addDoc(bookingsRef, bookingToSave);
  }
  
  // Update a booking
  updateBooking(booking: Booking): Promise<void> {
    const bookingRef = doc(this.firestore, `bookings/${booking.id}`);
    return updateDoc(bookingRef, {
      title: booking.title,
      description: booking.description,
      startTime: booking.startTime instanceof Date ? 
        Timestamp.fromDate(booking.startTime) : booking.startTime,
      endTime: booking.endTime instanceof Date ? 
        Timestamp.fromDate(booking.endTime) : booking.endTime
    });
  }
  
  // Delete a booking
  deleteBooking(id: string): Promise<void> {
    const bookingRef = doc(this.firestore, `bookings/${id}`);
    return deleteDoc(bookingRef);
  }
  
  // Check if a room is available for the specified time slot
  isRoomAvailable(roomId: string, startTime: Date, endTime: Date, 
                  excludeBookingId?: string): Observable<boolean> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const startTimestamp = Timestamp.fromDate(startTime);
    const endTimestamp = Timestamp.fromDate(endTime);
    
    const q = query(
      bookingsRef,
      where('roomId', '==', roomId),
      where('startTime', '<', endTimestamp),
      where('endTime', '>', startTimestamp)
    );
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(bookings => {
        if (excludeBookingId) {
          bookings = bookings.filter(b => b['id'] !== excludeBookingId);
        }
        return bookings.length === 0;
      })
    );
  }
  
  // Helper to convert Firestore Timestamps to Date objects
  private convertTimestamps(bookings: Booking[]): Booking[] {
    return bookings.map(booking => this.convertTimestamp(booking));
  }
  
  private convertTimestamp(booking: Booking): Booking {
    return {
      ...booking,
      startTime: booking.startTime instanceof Timestamp ? 
        (booking.startTime as Timestamp).toDate() : 
        new Date(booking.startTime as string),
      endTime: booking.endTime instanceof Timestamp ? 
        (booking.endTime as Timestamp).toDate() : 
        new Date(booking.endTime as string),
      createdAt: booking.createdAt instanceof Timestamp ? 
        (booking.createdAt as Timestamp).toDate() : 
        new Date(booking.createdAt as string)
    };
  }
}