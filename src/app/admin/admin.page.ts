import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Booking, Room } from '../models/booking.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  rooms: Room[] = [];
  selectedStatusFilter: string = 'all';
  selectedRoomFilter: string = 'all';
  selectedDateFilter: string = 'all';
  isLoading: boolean = true;
  
  // Stats properties
  totalBookings: number = 0;
  pendingBookings: number = 0;
  approvedBookings: number = 0;
  rejectedBookings: number = 0;
  bookingsByRoom: {[key: string]: number} = {};
  
  constructor(
    private firestore: Firestore,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadRooms();
    this.loadBookings();
  }

  async loadRooms() {
    try {
      const roomsRef = collection(this.firestore, 'rooms');
      const snapshot = await getDocs(roomsRef);
      this.rooms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Room));
    } catch (error) {
      console.error('Error loading rooms:', error);
      this.presentToast('Failed to load rooms');
    }
  }

  async loadBookings() {
    this.isLoading = true;
    try {
      const bookingsRef = collection(this.firestore, 'bookings');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      this.bookings = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const booking = { id: docSnapshot.id, ...docSnapshot.data() } as any;
        
        // Fetch room details for each booking
        try {
          const roomDocRef = doc(this.firestore, 'rooms', booking.roomId);
          const roomSnapshot = await getDocs(query(collection(this.firestore, 'rooms'), where('id', '==', booking.roomId)));
          if (!roomSnapshot.empty) {
            const roomData = roomSnapshot.docs[0].data() as Room;
            booking.roomName = roomData.name;
          } else {
            booking.roomName = 'Unknown Room';
          }
        } catch (error) {
          console.error('Error fetching room for booking:', error);
          booking.roomName = 'Error Loading Room';
        }
        
        // Format dates for display
        booking.formattedStartTime = this.formatTimestamp(booking.startTime);
        booking.formattedEndTime = this.formatTimestamp(booking.endTime);
        booking.formattedCreatedAt = this.formatTimestamp(booking.createdAt);
        
        return booking;
      }));
      
      this.filteredBookings = [...this.bookings];
      this.calculateStats();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading bookings:', error);
      this.presentToast('Failed to load bookings');
    } finally {
      this.isLoading = false;
    }
  }

  formatTimestamp(timestamp: any): string {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleString();
  }

  async updateBookingStatus(bookingId: string, status: 'approved' | 'rejected', adminNotes: string = '') {
    try {
      const bookingRef = doc(this.firestore, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        status, 
        adminNotes: adminNotes || (status === 'approved' ? 'Booking approved by admin' : 'Booking rejected by admin')
      });
      
      // Update local state
      const index = this.bookings.findIndex(b => b.id === bookingId);
      if (index !== -1) {
        this.bookings[index].status = status;
        this.bookings[index].adminNotes = adminNotes;
        this.calculateStats();
        this.applyFilters();
      }
      
      this.presentToast(`Booking ${status} successfully`);
    } catch (error) {
      console.error('Error updating booking:', error);
      this.presentToast('Failed to update booking status');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }

  calculateStats() {
    // Reset stats
    this.totalBookings = this.bookings.length;
    this.pendingBookings = this.bookings.filter(b => b.status === 'pending').length;
    this.approvedBookings = this.bookings.filter(b => b.status === 'approved').length;
    this.rejectedBookings = this.bookings.filter(b => b.status === 'rejected').length;
    
    // Calculate bookings by room
    this.bookingsByRoom = {};
    this.bookings.forEach(booking => {
      const roomId = booking.roomId;
      const roomName = booking.roomName || 'Unknown Room';
      const key = `${roomId}:${roomName}`;
      
      if (!this.bookingsByRoom[key]) {
        this.bookingsByRoom[key] = 0;
      }
      this.bookingsByRoom[key]++;
    });
  }

  applyFilters() {
    this.filteredBookings = this.bookings.filter(booking => {
      // Status filter
      if (this.selectedStatusFilter !== 'all' && booking.status !== this.selectedStatusFilter) {
        return false;
      }
      
      // Room filter
      if (this.selectedRoomFilter !== 'all' && booking.roomId !== this.selectedRoomFilter) {
        return false;
      }
      
      // Date filter
      if (this.selectedDateFilter !== 'all') {
        const bookingDate = booking.startTime instanceof Timestamp 
          ? booking.startTime.toDate() 
          : new Date(booking.startTime);
        
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        if (this.selectedDateFilter === 'today') {
          return bookingDate.toDateString() === today.toDateString();
        } else if (this.selectedDateFilter === 'tomorrow') {
          return bookingDate.toDateString() === tomorrow.toDateString();
        } else if (this.selectedDateFilter === 'week') {
          return bookingDate >= today && bookingDate <= nextWeek;
        }
      }
      
      return true;
    });
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onRoomFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  promptAdminNotes(bookingId: string, action: 'approve' | 'reject') {
    // In a real application, you would use a proper modal/dialog
    const notes = prompt(`Enter notes for ${action === 'approve' ? 'approving' : 'rejecting'} this booking:`);
    this.updateBookingStatus(
      bookingId, 
      action === 'approve' ? 'approved' : 'rejected', 
      notes || undefined
    );
  }

  // Helper methods for room stats display
  getRoomKeys(): string[] {
    return Object.keys(this.bookingsByRoom);
  }

  getRoomName(key: string): string {
    return key.split(':')[1];
  }
}