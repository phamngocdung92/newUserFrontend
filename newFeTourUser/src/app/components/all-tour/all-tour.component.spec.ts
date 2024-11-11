import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTourComponent } from './all-tour.component';

describe('AllTourComponent', () => {
  let component: AllTourComponent;
  let fixture: ComponentFixture<AllTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllTourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
