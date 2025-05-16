import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  getDoc
} from '@angular/fire/firestore';
import { AlertController, LoadingController, SegmentCustomEvent } from '@ionic/angular';
import { Booking, Room } from 'src/app/models/booking.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-track-bookings',
  templateUrl: './track-bookings.page.html',
  styleUrls: ['./track-bookings.page.scss'],
})
export class TrackBookingsPage implements OnInit {
  bookings: Array<Booking & { roomName?: string }> = [];
  filteredBookings: Array<Booking & { roomName?: string }> = [];
  isLoading = false;
  searchControl = new FormControl('');
  statusFilter = 'all';
  trackingMode = 'userId'; // Default to tracking by userId
  bookingIdToTrack = ''; // For tracking a specific booking
  userId: string = ''; // This would typically come from auth service
  userName: string = ''; // This would typically come from auth service
  isAdmin = false; // This would typically be determined by user role

  constructor(
    private firestore: Firestore,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    // For demo purposes - in a real app, you'd get this from your auth service
    // Simulating a logged-in user
    this.userId = 'user123';
    this.userName = 'Demo User';
    this.isAdmin = false; // Set to true to see admin features

    // Set up search listener
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        if (this.trackingMode === 'bookingId' && searchTerm) {
          this.bookingIdToTrack = searchTerm;
          this.loadBookingById(searchTerm);
        } else {
          this.filterBookings();
        }
      });

    this.loadBookings();
  }

  onTrackingModeChange(event: SegmentCustomEvent) {
    this.trackingMode = event.detail.value as string;
    
    // Clear search when switching modes
    if (this.trackingMode === 'userId') {
      this.searchControl.setValue('');
      this.loadBookings();
    } else {
      // If there's already a bookingId in the search, use it
      const currentSearch = this.searchControl.value;
      if (currentSearch) {
        this.bookingIdToTrack = currentSearch;
        this.loadBookingById(currentSearch);
      } else {
        // Clear results when switching to bookingId mode without a bookingId
        this.filteredBookings = [];
      }
    }
  }

  async loadBookings() {
    if (this.trackingMode === 'bookingId' && this.bookingIdToTrack) {
      return this.loadBookingById(this.bookingIdToTrack);
    }

    this.isLoading = true;
    const loader = await this.loadingCtrl.create({
      message: 'Loading bookings...'
    });
    await loader.present();

    try {
      const bookingsRef = collection(this.firestore, 'bookings');
      let q;
      
      // If admin, get all bookings, otherwise only get the current user's bookings
      if (this.isAdmin) {
        q = query(bookingsRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(bookingsRef, where('userId', '==', this.userId), orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      
      // Get bookings
      const bookings = await Promise.all(snapshot.docs.map(async docSnapshot => {
        const data = docSnapshot.data() as Booking;
        const bookingWithId = {
          ...data,
          id: docSnapshot.id,
          startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
          endTime: data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        };
        
        // Fetch room name
        try {
          const roomDocRef = doc(this.firestore, 'rooms', data.roomId);
          const roomSnapshot = await getDoc(roomDocRef);
          const roomData = roomSnapshot.data() as Room | undefined;
          
          return {
            ...bookingWithId,
            roomName: roomData?.name || 'Unknown Room'
          };
        } catch (error) {
          return {
            ...bookingWithId,
            roomName: 'Unknown Room'
          };
        }
      }));

      this.bookings = bookings;
      this.filterBookings();
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.showAlert('Error', 'Failed to load bookings. Please try again.');
    } finally {
      this.isLoading = false;
      loader.dismiss();
    }
  }

  async loadBookingById(bookingId: string) {
    if (!bookingId) {
      this.filteredBookings = [];
      return;
    }

    this.isLoading = true;
    const loader = await this.loadingCtrl.create({
      message: 'Loading booking...'
    });
    await loader.present();

    try {
      const bookingsRef = collection(this.firestore, 'bookings');
      const q = query(bookingsRef, where('bookingId', '==', bookingId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        this.filteredBookings = [];
        this.showAlert('Not Found', `No booking found with ID: ${bookingId}`);
        return;
      }

      // Get booking
      const bookings = await Promise.all(snapshot.docs.map(async docSnapshot => {
        const data = docSnapshot.data() as Booking;
        const bookingWithId = {
          ...data,
          id: docSnapshot.id,
          startTime: data.startTime instanceof Timestamp ? data.startTime.toDate() : new Date(data.startTime),
          endTime: data.endTime instanceof Timestamp ? data.endTime.toDate() : new Date(data.endTime),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
        };
        
        // Fetch room name
        try {
          const roomDocRef = doc(this.firestore, 'rooms', data.roomId);
          const roomSnapshot = await getDoc(roomDocRef);
          const roomData = roomSnapshot.data() as Room | undefined;
          
          return {
            ...bookingWithId,
            roomName: roomData?.name || 'Unknown Room'
          };
        } catch (error) {
          return {
            ...bookingWithId,
            roomName: 'Unknown Room'
          };
        }
      }));

      this.bookings = bookings;
      this.filteredBookings = bookings; // Direct assignment since we're looking for a specific booking
    } catch (error) {
      console.error('Error loading booking by ID:', error);
      this.showAlert('Error', 'Failed to load booking. Please try again.');
    } finally {
      this.isLoading = false;
      loader.dismiss();
    }
  }

  filterBookings() {
    // If in bookingId mode, don't apply additional filtering
    if (this.trackingMode === 'bookingId' && this.bookingIdToTrack) {
      return;
    }

    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    
    this.filteredBookings = this.bookings.filter(booking => {
      // Apply status filter if in userId mode
      if (this.statusFilter !== 'all' && booking.status !== this.statusFilter) {
        return false;
      }
      
      // Apply search term filter
      if (searchTerm) {
        return (
          booking.bookingId.toLowerCase().includes(searchTerm) ||
          booking.title.toLowerCase().includes(searchTerm) ||
          booking.roomName?.toLowerCase().includes(searchTerm) ||
          booking.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    });
  }

  onStatusFilterChange(event: any) {
    this.statusFilter = event.detail.value;
    this.filterBookings();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'pending': return 'warning';
      default: return 'medium';
    }
  }

  async viewBookingDetails(booking: Booking & { roomName?: string }) {
    const alert = await this.alertCtrl.create({
      header: 'Booking Details',
      subHeader: `Booking ID: ${booking.bookingId}`,
      message: `
        <strong>Title:</strong> ${booking.title}<br>
        <strong>Room:</strong> ${booking.roomName || 'Unknown'}<br>
        <strong>Status:</strong> ${booking.status}<br>
        <strong>Start:</strong> ${this.formatDate(booking.startTime)}<br>
        <strong>End:</strong> ${this.formatDate(booking.endTime)}<br>
        <strong>Description:</strong> ${booking.description || 'N/A'}<br>
        ${booking.adminNotes ? `<strong>Admin Notes:</strong> ${booking.adminNotes}` : ''}
      `,
      buttons: ['Close']
    });

    await alert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  formatDate(date: Date | string | Timestamp): string {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else {
      dateObj = new Date(date);
    }
    
    return dateObj.toLocaleString();
  }
}