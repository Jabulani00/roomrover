// src/app/models/booking.model.ts
import { Timestamp } from '@angular/fire/firestore';

export interface Booking {
  id?: string;
  bookingId: string;
  roomId: string;
  title: string;
  description: string;
  startTime: Date | string | Timestamp;
  endTime: Date | string | Timestamp;
  userId: string;
  userName: string;
  createdAt: Date | string | Timestamp;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}


export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  imageUrl?: string;
   imageBase64?: string;
}