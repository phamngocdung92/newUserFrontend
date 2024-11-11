import { Cart } from "./Cart";
import { Tour } from "./Tour";

export class CartDetail {
    'cartDetailId': number;
    'quantity': number;
    'price': number;
    'tour': Tour;
    'cart': Cart;
    'start_date': Date; 
    'end_date': Date;

    constructor(id: number, quantity: number, price: number, tour: Tour, cart: Cart, start_date: Date, end_date: Date) {
        this.cartDetailId = id;
        this.quantity = quantity;
        this.price = price;
        this.tour = tour;
        this.cart = cart;
        this.start_date = start_date;
        this.end_date = end_date;
    }
}
