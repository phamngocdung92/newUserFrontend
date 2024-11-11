import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { CartService } from 'src/app/services/cart.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];

  discount!:number;
  amount!:number;
  amountReal!:number;
  departureDate: { year: number, month: number, day: number } = { year: 2021, month: 11, day: 12 }; 
  returnDate: { year: number, month: number, day: number } = { year: 2024, month: 11, day: 12 }; 

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    private sessionService: SessionService) {

   }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.discount=0;
    this.amount=0;
    this.amountReal=0;
    this.getAllItem();
  }

  getAllItem() {
    let email = this.sessionService.getUser();
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
        this.cartDetails = data as CartDetail[];
        this.cartService.setLength(this.cartDetails.length);
        this.cartDetails.forEach(item=>{
          if (!item.start_date) {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            var tempStartDate = { year: yyyy, month: mm, day: dd };
            const startDate = new Date(tempStartDate.year, tempStartDate.month - 1, tempStartDate.day);
            item.start_date = startDate;
          }
          if (!item.end_date) {
            var today = new Date();
            var dd = today.getDate() + 1;
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            var tempEndDate = { year: yyyy, month: mm, day: dd };
            const endDate = new Date(tempEndDate.year, tempEndDate.month - 1, tempEndDate.day);
            item.end_date = endDate;

          }
          this.amountReal += item.tour.price * item.quantity;
          this.amount += item.price;
        })
        this.discount = this.amount - this.amountReal;
      })
    })
  }

  update(id: number, quantity: number, start_date: { year: number, month: number, day: number }, end_date: { year: number, month: number, day: number }) {
    if (quantity < 1) {
      this.delete(id);
    } else {
      this.cartService.getOneDetail(id).subscribe(data => {
        this.cartDetail = data as CartDetail;
        this.cartDetail.quantity = quantity;
        this.cartDetail.price = (this.cartDetail.tour.price * (1 - this.cartDetail.tour.discount / 100)) * quantity;
        if (!this.cartDetail.start_date) {
          //get current date
          var today = new Date();
          var dd = today.getDate();
          var mm = today.getMonth() + 1;
          var yyyy = today.getFullYear();
          var tempStartDate = { year: yyyy, month: mm, day: dd };
          // this.cartDetail.start_date = { year: yyyy, month: mm, day: dd };
          const start_date = new Date(tempStartDate.year, tempStartDate.month - 1, tempStartDate.day);
        }
        if (!this.cartDetail.end_date) {
          // item.returnDate = { year: 2024, month: 11, day: 12 };
          //get current date + 1
          var today = new Date();
          var dd = today.getDate() + 1;
          var mm = today.getMonth() + 1;
          var yyyy = today.getFullYear();
          // this.cartDetail.end_date = { year: yyyy, month: mm, day: dd };
          var tempEndDate = { year: yyyy, month: mm, day: dd };
          const end_date = new Date(tempEndDate.year, tempEndDate.month - 1, tempEndDate.day);
        }
        console.log("cart detail: ",this.cartDetail);
        this.cartService.updateDetail(this.cartDetail).subscribe(data => {
          this.ngOnInit();
        }, error => {
          this.toastr.error('Lỗi!' + error.status, 'Hệ thống');
        })
      }, error => {
        this.toastr.error('Lỗi! ' + error.status, 'Hệ thống');
      })
    }
  }

  delete(id: number) {
    Swal.fire({
      title: 'Bạn muốn xoá tour du lịch này ra khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Không',
      confirmButtonText: 'Xoá'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.deleteDetail(id).subscribe(data => {
          this.toastr.success('Xoá thành công!', 'Hệ thống');
          this.ngOnInit();
        }, error => {
          this.toastr.error('Xoá thất bại! ' + error.status, 'Hệ thống');
        })
      }
    })
  }

}
