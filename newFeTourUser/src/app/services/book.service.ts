import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cart } from '../common/Cart';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  url = "http://localhost:8080/api/books";

  urlBookDetail = "http://localhost:8080/api/bookDetail";

  constructor(private httpClient: HttpClient) { }

  // post(email: string, cart: Cart) {
  //   return this.httpClient.post(this.url+'/'+email, cart);
  // }

  post(email: string, cart: Cart, start_date: Date, end_date: Date) {
    console.log("inservice");
    console.log("email: ",email);
    console.log("start_date: ",start_date);
    console.log("end_date: ",end_date);
    console.log("cart: ",cart);
    return this.httpClient.post(`${this.url}/${email}/${start_date}/${end_date}`, cart);
  }

  get(email:string) {
    return this.httpClient.get(this.url+'/user/'+email);
  }

  getById(id:number) {
    return this.httpClient.get(this.url+'/'+id);
  }

  getByBook(id:number) {
    return this.httpClient.get(this.urlBookDetail+'/book/'+id);
  }

  cancel(id: number) {
    return this.httpClient.get(this.url+'/cancel/'+id);
  }
}
