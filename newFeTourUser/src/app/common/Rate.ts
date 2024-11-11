import { Customer } from "./Customer";
import { BookDetail } from "./BookDetail";
import { Tour } from "./Tour";

export class Rate {
    'id': number;
    'rating': number;
    'comment': string;
    'rateDate': Date;
    'user': Customer;
    'tour': Tour;
    'bookDetail': BookDetail;
}
