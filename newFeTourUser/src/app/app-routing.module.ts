// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ByCategoryComponent } from './components/by-category/by-category.component';
import { TourDetailComponent } from './components/tour-detail/tour-detail.component';

const routes: Routes = [
  // Define your routes here
  // Example:
  // { path: '', component: HomeComponent },
  // { path: 'about', component: AboutComponent },
//   { path: 'by-category/:id', component: ByCategoryComponent },
  
//   { path: 'tour-detail/:id', component: TourDetailComponent },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            initialNavigation: "enabledBlocking",
            scrollPositionRestoration: 'enabled',
        })
    ],
  exports: [RouterModule]
})
export class AppRoutingModule { }