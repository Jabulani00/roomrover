import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRoomPage } from './add-room.page';

describe('AddRoomPage', () => {
  let component: AddRoomPage;
  let fixture: ComponentFixture<AddRoomPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRoomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
