import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Price } from '../models/price';
import { } from 'rxjs/operators';
import * as signalR from '@microsoft/signalr';
import { Stock } from '../models/stock';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private predictedPrice: BehaviorSubject<Array<Price>> = new BehaviorSubject<any>([]);
  private realPrice: BehaviorSubject<Array<Price>> = new BehaviorSubject<any>([]);
  private stocks: BehaviorSubject<Array<Stock>> = new BehaviorSubject<any>([]);
  realPrice$: Observable<Array<Price>> = this.realPrice.asObservable();
  predictedPrice$: Observable<Array<Price>> = this.predictedPrice.asObservable();
  stocks$: Observable<Array<Stock>> = this.stocks.asObservable();
  hubConnection: any;

  constructor() { 
    this.initSignalr();
  }

  initSignalr() {
    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.baseUrl}stockHub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
    } catch(error) {
      console.log("ERROR" + error)
    }
    this.hubConnection.start().catch((error: any) => {
      console.error(`START ERROR error during start - ${this.hubConnection.state} with error - ${error}`);
    });
    console.log("In initSignalr");
    this.hubConnection.on('GotPredictedPrices', (data: Array<Price>) => { 
      this.predictedPrice.next(data);
    });
    this.hubConnection.on('GotRealPrices', (data: any) => { 
      this.realPrice.next(data);
    });
    this.hubConnection.on('GotStocks', (data: any) => { 
      this.stocks.next(data);
    });
  }
}