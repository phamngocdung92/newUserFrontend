import { Category } from "./Category";

export class Tour {
    'tourId':number;
    'name':string;
    'quantity': number;
    'price': number;
    'discount':number;
    'image': string;
    'description': string;
    'enteredDate': Date;
    'category': Category;
    'status': boolean;
    'sold': number;

    constructor(id:number) {
        this.tourId = id;
    }
}
