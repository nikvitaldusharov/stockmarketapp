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

    this.signalrSvc.stocks$.pipe(
      map((stocks: Array<Stock>) => {
        this.arrayOfStocks = this.arrayOfStocks.concat(stocks);
        return stocks.map(x => x.id);
      }),
      concatMap((ids: Array<string>) => {
        return this.http.post<Array<Price>>(`${environment.baseUrl}real-prices`, ids);
      }),
      map((prices: Array<Price>) => {
        const ids = [];
        for(const price of prices) {
          ids.push(price.id);
          const stock = this.arrayOfStocks.find(x => x.id === price.id);
          if (stock) {
            stock.realPrice = price.value;
          }
        }
        return ids;
      }),
      concatMap((ids: Array<string>) => {
        return this.http.post<Array<Price>>(`${environment.baseUrl}predicted-prices`, ids);
      })
    ).subscribe((predictedPrices: Array<Price>) => {
      for(const price of predictedPrices) {
        const stock = this.arrayOfStocks.find(x => x.id === price.id);
        if (stock) {
          stock.predictedPrice = price.value;
          if(stock.realPrice && stock.predictedPrice) {
            stock.predictedToRealPrice = stock.predictedPrice / stock.realPrice;
          }
        }
      }
    });
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
