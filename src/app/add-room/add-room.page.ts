import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Room } from 'src/app/models/booking.model';
import { doc, setDoc } from '@angular/fire/firestore';
@Component({
  selector: 'app-add-room',
  templateUrl: './add-room.page.html',
  styleUrls: ['./add-room.page.scss'],
})
export class AddRoomPage implements OnInit {
  roomForm!: FormGroup;
imageBase64: string | null = null;
imagePreview: string | null = null;
  constructor(private fb: FormBuilder, private firestore: Firestore) {}

  ngOnInit() {
    this.roomForm = this.fb.group({
      name: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      amenities: [''], // Will be split into array
      imageUrl: [''],
    });
  }
onImageSelected(event: any) {
  const file: File = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result as string;
      this.imagePreview = this.imageBase64; // For preview
    };
    reader.readAsDataURL(file);
  }
}
 async addRoom() {
  if (this.roomForm.invalid) return;

  const formValue = this.roomForm.value;
  const room: any = {
    name: formValue.name,
    capacity: formValue.capacity,
    location: formValue.location,
    amenities: formValue.amenities.split(',').map((a: string) => a.trim()),
    imageBase64: this.imageBase64 || null,
  };

  const roomId = Date.now().toString(); // Generates a unique digit-based ID (e.g., "1715874590123")

  const roomRef = doc(this.firestore, `rooms/${roomId}`);
  await setDoc(roomRef, room);

  alert('Room added successfully!');
  this.roomForm.reset();
  this.imageBase64 = null;
  this.imagePreview = null;
}

}
