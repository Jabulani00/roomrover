import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-startone',
  templateUrl: './startone.page.html',
  styleUrls: ['./startone.page.scss'],
})
export class StartonePage implements OnInit {
  // Admin login variables
  showAdminModal = false;
  adminUsername = '';
  adminPassword = '';
 
  // Featured rooms data
  featuredRooms = [
    {
      name: 'Conference Room A',
      capacity: 20,
      location: 'Main Building, Floor 2',
      imageClass: 'conference'
    },
    {
      name: 'Meeting Room B',
      capacity: 8,
      location: 'East Wing, Floor 1',
      imageClass: 'meeting'
    },
    {
      name: 'Creative Studio',
      capacity: 12,
      location: 'Innovation Hub, Floor 3',
      imageClass: 'creative'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  // Admin login modal functions
  openAdminLogin() {
    this.showAdminModal = true;
  }

  dismissAdminModal() {
    this.showAdminModal = false;
    this.adminUsername = '';
    this.adminPassword = '';
  }

  loginAdmin() {
    // Simple default login for admin
    if (this.adminUsername === 'admin' && this.adminPassword === 'admin') {
      this.dismissAdminModal();
      this.router.navigate(['/admin']);
    } else {
      // You could add a toast or alert here for invalid credentials
      console.log('Invalid admin credentials');
    }
  }
}