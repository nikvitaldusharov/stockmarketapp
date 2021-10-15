import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockslistComponent } from './components/stockslist/stockslist.component';
import { StockslistComponent0 } from './components/stockslist0/stockslist0.component';

const routes: Routes = [
  { path: 'stock-list', component: StockslistComponent },
  { path: 'stock-list0', component: StockslistComponent0 },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
