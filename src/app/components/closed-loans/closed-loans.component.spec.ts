import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedLoansComponent } from './closed-loans.component';

describe('ClosedLoansComponent', () => {
  let component: ClosedLoansComponent;
  let fixture: ComponentFixture<ClosedLoansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClosedLoansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClosedLoansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
