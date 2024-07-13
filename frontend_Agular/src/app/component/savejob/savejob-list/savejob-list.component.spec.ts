import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavejobListComponent } from './savejob-list.component';

describe('SavejobListComponent', () => {
  let component: SavejobListComponent;
  let fixture: ComponentFixture<SavejobListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavejobListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SavejobListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
