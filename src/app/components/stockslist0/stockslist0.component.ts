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
    this.signalrSvc.stocks$.pipe() //concatMap

    // http://localhost:4200/stock-list0
    //добавить к arrayOfStocks
    //запросить real price  this.http.post<Array<Price>>(`${environment.baseUrl}real-prices`, ids);
    //request predicted price this.http.post<Array<Price>>(`${environment.baseUrl}predicted-prices`, ids);
    //stock.predictedToRealPrice = stock.predictedPrice / stock.realPrice;
    // to send data - https://webapplication120211011215142.azurewebsites.net/stocks
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
