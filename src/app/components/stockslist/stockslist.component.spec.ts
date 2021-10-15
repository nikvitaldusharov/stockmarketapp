import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockslistComponent } from './stockslist.component';

describe('StockslistComponent', () => {
  let component: StockslistComponent;
  let fixture: ComponentFixture<StockslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockslistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
