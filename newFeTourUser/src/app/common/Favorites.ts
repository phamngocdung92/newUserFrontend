import { Customer } from "./Customer";
import { Tour } from "./Tour";

export class Favorites {
    'favoriteId': number;
    'user': Customer;
    'tour': Tour;

    constructor(id: number, user: Customer, tour: Tour) {
        this.favoriteId = id;
        this.tour = tour;
        this.user = user;
    }
}
