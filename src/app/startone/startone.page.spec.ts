import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StartonePage } from './startone.page';

describe('StartonePage', () => {
  let component: StartonePage;
  let fixture: ComponentFixture<StartonePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StartonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
