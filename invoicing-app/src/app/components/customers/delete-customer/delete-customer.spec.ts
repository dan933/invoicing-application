import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCustomer } from './delete-customer';

describe('DeleteCustomer', () => {
  let component: DeleteCustomer;
  let fixture: ComponentFixture<DeleteCustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteCustomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteCustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
