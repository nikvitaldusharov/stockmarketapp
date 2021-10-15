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
    //TODO
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
