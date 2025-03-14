import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCitasModalComponent } from './edit-citas-modal.component';

describe('EditCitasModalComponent', () => {
  let component: EditCitasModalComponent;
  let fixture: ComponentFixture<EditCitasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCitasModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCitasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
