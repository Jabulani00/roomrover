import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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



  constructor(
    private router: Router,
    private toastController: ToastController
  ) {}

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

  async showInvalidToast() {
    const toast = await this.toastController.create({
      message: 'Invalid admin credentials',
      duration: 2000,
      color: 'danger',
    });
    toast.present();
  }

 async loginAdmin() {
  if (
    this.adminUsername === 'admin@rover.com' &&
    this.adminPassword === '1234567'
  ) {
    this.dismissAdminModal(); // Close modal first
    
    // Add a small delay to ensure modal closing animation completes
    setTimeout(() => {
      this.router.navigate(['/admin']);
    }, 150); // 150ms should be enough for most modal animations
    
  } else {
    this.showInvalidToast();
  }
}

}
