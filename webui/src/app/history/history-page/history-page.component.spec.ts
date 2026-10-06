import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HistoryPageComponent } from './history-page.component';
import { ApiService } from '../../services/api.service';

describe('HistoryPageComponent', () => {
  let component: HistoryPageComponent;
  let fixture: ComponentFixture<HistoryPageComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj<ApiService>('ApiService', ['getMessages']);
    apiService.getMessages.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HistoryPageComponent],
      providers: [{ provide: ApiService, useValue: apiService }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HistoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the signed-in user message history', () => {
    expect(apiService.getMessages).toHaveBeenCalled();
    expect(component.messages).toEqual([]);
    expect(component.loading).toBeFalse();
  });
});
