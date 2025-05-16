//src/app/services/reciept.service.ts
import { Injectable } from '@angular/core';
import { Booking, Room } from '../models/booking.model';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp type

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  constructor() {}

  /**
   * Generate an eye-catching booking receipt PDF
   * @param booking The booking data
   * @param roomName The name of the room
   * @returns The jsPDF document object
   */
  generateReceipt(booking: Booking, roomName: string): jsPDF {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set the primary purple color to match the theme
    const primaryColor = '#D05CE3';
    const primaryShade = '#b751c8';
    
    // Add a decorative header with gradient effect
    this.drawGradientHeader(doc, primaryColor, primaryShade);
    
    // Add company logo/title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text('ROOM BOOKING', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('RECEIPT', 105, 26, { align: 'center' });
    
    // Add decorative elements
    this.drawDecorativeElements(doc, primaryColor);
    
    // Add booking information
    this.addBookingDetails(doc, booking, roomName, primaryColor);
    
    // Add footer
    this.addFooter(doc, primaryColor);
    
    return doc;
  }
  
  /**
   * Save and open the PDF
   * @param doc The jsPDF document to save
   * @param booking The booking data for filename
   */
  saveReceipt(doc: jsPDF, booking: Booking): void {
    const startDate = this.getDateFromTimestamp(booking.startTime);
    const filename = `booking_${booking.userName.replace(/\s/g, '_')}_${startDate.toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }
  
  /**
   * Helper method to convert Firebase Timestamp, Date, or string to Date object
   * @param timestamp The timestamp to convert
   * @returns A JavaScript Date object
   */
  private getDateFromTimestamp(timestamp: string | Date | Timestamp): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else {
      return new Date(timestamp);
    }
  }
  
  /**
   * Draw a gradient header at the top of the PDF
   */
  private drawGradientHeader(doc: jsPDF, primaryColor: string, primaryShade: string): void {
    // Create gradient header
    doc.setFillColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.rect(0, 0, 210, 35, 'F');
    
    // Add some decorative elements to the header
    doc.setFillColor(parseInt(primaryShade.substring(1, 3), 16), 
                    parseInt(primaryShade.substring(3, 5), 16), 
                    parseInt(primaryShade.substring(5, 7), 16));
    doc.circle(170, 18, 12, 'F');
    doc.circle(180, 10, 8, 'F');
    doc.circle(30, 15, 10, 'F');
    doc.circle(15, 25, 7, 'F');
  }
  
  /**
   * Draw decorative elements throughout the receipt
   */
  private drawDecorativeElements(doc: jsPDF, primaryColor: string): void {
    // Add a subtle sidebar
    doc.setDrawColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.setLineWidth(1);
    doc.line(20, 40, 20, 230);
    
    // Add decorative icons
    doc.setFillColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.circle(20, 50, 3, 'F');  // Calendar icon
    doc.circle(20, 85, 3, 'F');  // Clock icon
    doc.circle(20, 120, 3, 'F'); // User icon
    doc.circle(20, 155, 3, 'F'); // Info icon
  }
  
  /**
   * Add booking details in a structured, visually appealing way
   */
  private addBookingDetails(doc: jsPDF, booking: Booking, roomName: string, primaryColor: string): void {
    // Set text color for headings
    doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    
    // Room information section
    doc.setFontSize(14);
    doc.text('Room Details', 30, 50);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.text(`Room: ${roomName}`, 30, 58);
    doc.text(`Room ID: ${booking.roomId}`, 30, 65);
    
    // Time information section
    doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.setFontSize(14);
    doc.text('Booking Time', 30, 85);
    
    // Format dates - use the helper method to handle different types
    const startTime = this.getDateFromTimestamp(booking.startTime);
    const endTime = this.getDateFromTimestamp(booking.endTime);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.text(`From: ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`, 30, 93);
    doc.text(`To: ${endTime.toLocaleDateString()} ${endTime.toLocaleTimeString()}`, 30, 100);
    
    // Duration calculation
    const durationMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    doc.text(`Duration: ${hours} hours, ${minutes} minutes`, 30, 107);
    
    // User information section
doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                parseInt(primaryColor.substring(3, 5), 16), 
                parseInt(primaryColor.substring(5, 7), 16));
doc.setFontSize(14);
doc.text('Booked By', 30, 120);

doc.setTextColor(80, 80, 80);
doc.setFontSize(11);
doc.text(`Name: ${booking.userName}`, 30, 128);
doc.text(`User ID: ${booking.userId}`, 30, 135);
doc.text(`Booking ID: ${booking.bookingId}`, 30, 142);


    
    // Booking information section
    doc.setTextColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.setFontSize(14);
    doc.text('Booking Details', 30, 155);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(11);
    doc.text(`Title: ${booking.title}`, 30, 163);
    
    // Handle multi-line description with word wrap
    const description = booking.description || 'No description provided';
    const splitDescription = doc.splitTextToSize(description, 150);
    doc.text(`Description: ${splitDescription[0]}`, 30, 170);
    
    // Add remaining description lines if any
    for (let i = 1; i < splitDescription.length; i++) {
      doc.text(splitDescription[i], 30, 170 + (i * 7));
    }
    
    // Add QR code placeholder (in a real app, you would generate an actual QR code)
    doc.setDrawColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16));
    doc.setLineWidth(0.5);
    doc.rect(140, 50, 40, 40);
    doc.setFontSize(8);
    doc.text('QR Code', 160, 75, { align: 'center' });
    
    // Add booking ID and timestamp - Handle the createdAt timestamp safely
    const createdDate = this.getDateFromTimestamp(booking.createdAt);
    doc.setFontSize(8);
    doc.text(`Booking Created: ${createdDate.toLocaleString()}`, 105, 200, { align: 'center' });
    doc.text(`Booking Reference: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 105, 205, { align: 'center' });
  }
  
  /**
   * Add a stylish footer to the receipt
   */
  private addFooter(doc: jsPDF, primaryColor: string): void {
    // Add the footer area
    doc.setFillColor(parseInt(primaryColor.substring(1, 3), 16), 
                    parseInt(primaryColor.substring(3, 5), 16), 
                    parseInt(primaryColor.substring(5, 7), 16), 0.8);
    doc.rect(0, 270, 210, 25, 'F');
    
    // Add footer text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Thank you for your booking!', 105, 280, { align: 'center' });
    doc.setFontSize(8);
    doc.text('For assistance, please contact support@example.com', 105, 285, { align: 'center' });
  }
}