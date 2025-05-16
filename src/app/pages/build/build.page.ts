import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  Firestore,
  doc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Booking, Room } from 'src/app/models/booking.model';
import { ReceiptService } from 'src/app/services/reciept.service';

@Component({
  selector: 'app-build',
  templateUrl: './build.page.html',
  styleUrls: ['./build.page.scss'],
})
export class BuildPage implements OnInit {
  bookingForm!: FormGroup;
  roomId: string = '';
  roomName: string = '';
  bookedTimes: { startTime: string; endTime: string }[] = [];
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private route: ActivatedRoute,
    private receiptService: ReceiptService // Added ReceiptService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';

    // Fetch room details
    const roomDocRef = doc(this.firestore, 'rooms', this.roomId);
    getDoc(roomDocRef).then(snapshot => {
      const roomData = snapshot.data() as Room | undefined;
      if (roomData) {
        this.roomName = roomData.name;
      }
    });

    // Build the form
    this.bookingForm = this.fb.group({
      roomId: [{ value: this.roomId, disabled: true }, Validators.required],
      title: ['', Validators.required],
      description: [''],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      userId: ['', Validators.required],
      userName: ['', Validators.required],
    });

    this.loadBookings();
  }

  async loadBookings() {
    const bookingRef = collection(this.firestore, 'bookings');
    const q = query(bookingRef, where('roomId', '==', this.roomId));
    const snapshot = await getDocs(q);

    this.bookedTimes = snapshot.docs.map(doc => {
      const data = doc.data() as Booking;
      return {
        startTime: (data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime)).toISOString(),
        endTime: (data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime)).toISOString()
      };
    });
  }

  // Generate a unique booking ID
  generateBookingId(): string {
    const timestamp = new Date().getTime();
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BK-${timestamp}-${randomPart}`;
  }

  async submitBooking() {
    if (this.bookingForm.invalid) return;
    this.isSubmitting = true;

    const formValue = this.bookingForm.getRawValue();

    const start = new Date(formValue.startTime).getTime();
    const end = new Date(formValue.endTime).getTime();

    // Check for valid time range
    if (start >= end) {
      alert('End time must be after start time');
      this.isSubmitting = false;
      return;
    }

    // Check for overlapping bookings
    const bookingRef = collection(this.firestore, 'bookings');
    const q = query(bookingRef, where('roomId', '==', this.roomId));
    const snapshot = await getDocs(q);

    const overlapping = snapshot.docs.some(doc => {
      const data = doc.data() as Booking;
      const existingStart = (data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime)).getTime();
      const existingEnd = (data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime)).getTime();
      return start < existingEnd && end > existingStart;
    });

    if (overlapping) {
      alert('This room is already booked for the selected time range.');
      this.isSubmitting = false;
      return;
    }

    // Generate unique booking ID
    const bookingId = this.generateBookingId();

    const booking: Booking = {
      ...formValue,
      bookingId: bookingId,
      roomId: this.roomId,
      createdAt: Timestamp.now(),
      status: 'pending' // Default status is pending until admin approves
    };

    try {
      await addDoc(bookingRef, booking);
      
      // Generate and save receipt PDF
      this.generateBookingReceipt(booking);
      
      alert(`Booking request submitted successfully! Your booking ID is ${bookingId}. It requires admin approval before confirmation.`);
      this.bookingForm.reset();
      this.loadBookings(); // refresh booked times
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  // New method to generate receipt
  generateBookingReceipt(booking: Booking): void {
    // Generate the receipt using the ReceiptService
    const receiptDoc = this.receiptService.generateReceipt(booking, this.roomName);
    
    // Save the receipt and offer download
    this.receiptService.saveReceipt(receiptDoc, booking);
    
    console.log(`Receipt generated for booking ID: ${booking.bookingId}`);
  }

  getNextAvailableTime(): string {
    const now = Date.now();
    const futureBookings = this.bookedTimes
      .map(b => ({
        start: new Date(b.startTime).getTime(),
        end: new Date(b.endTime).getTime()
      }))
      .filter(b => b.end > now)
      .sort((a, b) => a.start - b.start);

    for (let i = 0; i < futureBookings.length - 1; i++) {
      if (futureBookings[i].end < futureBookings[i + 1].start) {
        return new Date(futureBookings[i].end).toISOString();
      }
    }

    return futureBookings.length
      ? new Date(futureBookings[futureBookings.length - 1].end).toISOString()
      : new Date().toISOString();
  }
}