import { Component, OnInit } from '@angular/core';
import { SignalrService } from 'src/app/services/signalr.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Price } from '../../models/price';

@Component({
  selector: 'app-stockslist',
  templateUrl: './stockslist.component.html',
  styleUrls: ['./stockslist.component.scss']
})
export class StockslistComponent implements OnInit {

  private combinedPrices: Observable<any> = EMPTY;

  constructor(private signalrSvc: SignalrService) {
  }

  ngOnInit(): void {

    // this.httpClient.get(`${environment.baseUrl}stocks`).pipe(
    //   tap((stocks: any) => this.arrayOfStocks = stocks),
    //   switchMap((stocks: any) => this.httpClient.post(`${environment.baseUrl}prices`, {
    //     ids: stocks.map((x: any) => x.id)
    //   }))
    // ).subscribe((prices: any) => {
    //   this.arrayOfStocks.forEach(stock => {
    //     stock.predictedPrice = prices[stock.id].predictedPrice;
    //     stock.realPrice = prices[stock.id].realPrice;
    //     stock.predictedToRealPrice = stock.predictedPrice/stock.realPrice;
    //   });
    // });

    this.combinedPrices = combineLatest([this.signalrSvc.realPrice$, this.signalrSvc.predictedPrice$]) as Observable<any>;
    this.combinedPrices.pipe(map(([realPrice, predictedPrice]: Array<Array<Price>>) => {
      if (!realPrice?.length) {
        return [];
      }
      const combined: any = {};
      realPrice.forEach(rp => {
        const pp = predictedPrice.find(x => x.id === rp.id);
        combined[rp.id] = {
          real: rp.value,
          predicted: pp?.value ? pp.value : rp.value
        };
      });
      return combined;
    })).subscribe((combined: any) => {
      for(const stock of this.arrayOfStocks) {
        const prices = combined[stock.id];
        if (prices) {
          stock.predictedPrice = prices.predicted;
          stock.realPrice = prices.real;
          stock.predictedToRealPrice = prices.predicted/prices.real;
        }
      }
      this.arrayOfStocks = [...this.arrayOfStocks];
    });
  }

  arrayOfStocks: Array<Stock> = [
    {
      id: "7e3b63f9-9de3-47b5-b017-282582e3b9bb",
      name: "OOOapple",
      realPrice: 0,
      predictedPrice: 0,
      predictedToRealPrice: 0
    },
    {
      id: "ac7435cc-4c0e-4e65-b8b9-0aad3a1c9a65",
      name: "OOOgoogle",
      realPrice: 0,
      predictedPrice: 0,
      predictedToRealPrice: 0
    },
    {
      id: "8ed034ee-d2e6-4b15-9d79-c5a7d5987283",
      name: "OOOamazon",
      realPrice: 0,
      predictedPrice: 0,
      predictedToRealPrice: 0
    },
    {
      id: "208ad1d3-0fc1-4d79-a1d6-ac85d2b4c181",
      name: "OOOEmap",
      realPrice: 0,
      predictedPrice: 0,
      predictedToRealPrice: 0
    },
    {
      id: "eb6e8954-ecdd-4c43-a537-f39f78ffd24d",
      name: "OOOLux",
      realPrice: 0,
      predictedPrice: 0,
      predictedToRealPrice: 0
    },
    {
      id: "cef0ed0f-dbe6-4f57-98ca-d63a1b89a671",
      name: "OOOAwesomeCompany",
      realPrice: 0,
      predictedPrice: 0,
      predictedToRealPrice: 0
    },
    {
      id: "ced4ecd5-324d-43a4-8883-da9077865078",
      name: "OOOFgupRus",
      realPrice: 0,
      predictedPrice: 0,
      predictedToRealPrice: 0
    },
  ];
}

interface Stock {
  id: string;
  name: string;
  predictedPrice: number;
  realPrice: number;
  predictedToRealPrice: number;
}
