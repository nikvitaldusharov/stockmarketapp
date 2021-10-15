import { Component, OnInit } from '@angular/core';
import { SignalrService } from 'src/app/services/signalr.service';
import { concatMap, map, startWith, switchMap, tap } from 'rxjs/operators';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Price } from '../../models/price';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-stockslist',
  templateUrl: './stockslist0.component.html',
  styleUrls: ['./stockslist0.component.scss']
})
export class StockslistComponent0 implements OnInit {

  private combinedPrices: Observable<any> = EMPTY;

  constructor(private http: HttpClient, private signalrSvc: SignalrService) {
  }

  ngOnInit(): void {
    //TODO
  }

  arrayOfStocks: Array<Stock> = [];
}

interface Stock {
  id: string;
  name: string;
  predictedPrice: number;
  realPrice: number;
  predictedToRealPrice: number;
}
