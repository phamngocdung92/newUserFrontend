import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  url = 'http://localhost:8080/api/tours';

  constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get(this.url);
  }

  getLasted() {
    return this.httpClient.get(this.url+'/latest');
  }

  getBestSeller() {
    return this.httpClient.get(this.url+'/bestseller');
  }

  getRated() {
    return this.httpClient.get(this.url+'/rated');
  }

  getOne(id: number) {
    return this.httpClient.get(this.url+'/'+id);
  }

  getByCategory(id: number) {
    return this.httpClient.get(this.url+'/category/'+id);
  }

  getSuggest(categoryId: number, tourId: number) {
    return this.httpClient.get(this.url+'/suggest/'+categoryId+"/"+tourId);
  }
  getByMultiCategory(id: number) {
    return this.httpClient.get(this.url+'/categories?'+'ids='+id);
  }
  getTourImageList(id: number) {
    return this.httpClient.get<string[]>(`${this.url}/getTourImages/${id}`);
  }
}
