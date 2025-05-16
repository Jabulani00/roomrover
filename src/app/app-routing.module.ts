import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'message/:id',
    loadChildren: () => import('./view-message/view-message.module').then( m => m.ViewMessagePageModule)
  },
  {
    path: '',
    redirectTo: 'startone',
    pathMatch: 'full'
  },
  {
    path: 'build/:roomId',
    loadChildren: () => import('./pages/build/build.module').then(m => m.BuildPageModule)
  },
 
  {
    path: 'startone',
    loadChildren: () => import('./startone/startone.module').then( m => m.StartonePageModule)
  },
  {
    path: 'add-room',
    loadChildren: () => import('./add-room/add-room.module').then( m => m.AddRoomPageModule)
  },
  {
    path: 'room-list',
    loadChildren: () => import('./room-list/room-list.module').then( m => m.RoomListPageModule)
  },
  {
    path: 'track-bookings',
    loadChildren: () => import('./track-bookings/track-bookings.module').then( m => m.TrackBookingsPageModule)
  },  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },




];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
