import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaffleManage } from './raffle-manage';

describe('RaffleManage', () => {
  let component: RaffleManage;
  let fixture: ComponentFixture<RaffleManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaffleManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaffleManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
