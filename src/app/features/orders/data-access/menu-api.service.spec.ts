import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MenuApiService } from './menu-api.service';

describe('MenuApiService', () => {
  let service: MenuApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MenuApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the menu collection', () => {
    const menu = [{ id: 'm1', name: 'Koshary', category: 'Mains', price: 85 }];
    service.getMenu().subscribe((items) => expect(items).toEqual(menu));

    const request = http.expectOne('http://localhost:3000/menu');
    expect(request.request.method).toBe('GET');
    request.flush(menu);
  });
});
