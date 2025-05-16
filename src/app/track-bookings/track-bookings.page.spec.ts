import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrackBookingsPage } from './track-bookings.page';

describe('TrackBookingsPage', () => {
  let component: TrackBookingsPage;
  let fixture: ComponentFixture<TrackBookingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackBookingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
