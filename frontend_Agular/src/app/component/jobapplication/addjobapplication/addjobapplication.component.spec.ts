import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddjobapplicationComponent } from './addjobapplication.component';

describe('AddjobapplicationComponent', () => {
  let component: AddjobapplicationComponent;
  let fixture: ComponentFixture<AddjobapplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddjobapplicationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddjobapplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
