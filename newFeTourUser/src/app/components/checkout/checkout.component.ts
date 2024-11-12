import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ICreateOrderRequest, IPayPalConfig } from 'ngx-paypal';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { ChatMessage } from 'src/app/common/ChatMessage';
import { District } from 'src/app/common/District';
import { Notification } from 'src/app/common/Notification';
import { Book } from 'src/app/common/Book';
import { Province } from 'src/app/common/Province';
import { Ward } from 'src/app/common/Ward';
import { CartService } from 'src/app/services/cart.service';
import { NotificationService } from 'src/app/services/notification.service';
import { BookService } from 'src/app/services/book.service';
import { ProvinceService } from 'src/app/services/province.service';
import { SessionService } from 'src/app/services/session.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];

  discount!: number;
  amount!: number;
  amountReal!: number;

  postForm: FormGroup;

  provinces!: Province[];
  districts!: District[];
  wards!: Ward[];

  province!: Province;
  district!: District;
  ward!: Ward;
  sendingStartDate!: Date;
  sendingEndDate!: Date;
  formattedStartDate!: any;
  formattedEndDate!: any;

  amountPaypal !:number;
  provinceCode!: number;
  districtCode!: number;
  wardCode!: number;
  public payPalConfig ? : IPayPalConfig;

  constructor(
    private cartService: CartService,
    private toastr: ToastrService,
    private router: Router,
    private sessionService: SessionService,
    private bookService: BookService,
    private location: ProvinceService,
    private webSocketService: WebSocketService,
    private notificationService: NotificationService) {
    this.postForm = new FormGroup({
      'phone': new FormControl(null, [Validators.required, Validators.pattern('(0)[0-9]{9}')]),
      'province': new FormControl(0, [Validators.required, Validators.min(1)]),
      'district': new FormControl(0, [Validators.required, Validators.min(1)]),
      'ward': new FormControl(0, [Validators.required, Validators.min(1)]),
      'number': new FormControl('', Validators.required),
      'start_date': new FormControl(''),
      'end_date': new FormControl(''),
    })
  }

  ngOnInit(): void {
    this.checkOutPaypal();
    this.webSocketService.openWebSocket();
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.discount = 0;
    this.amount = 0;
    this.amountPaypal = 0;
    this.amountReal = 0;
    this.getAllItem();
    this.getProvinces();
  }

  getAllItem() {
    let email = this.sessionService.getUser();
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      console.log("cart: ",this.cart);
      this.postForm = new FormGroup({
        'phone': new FormControl(this.cart.phone, [Validators.required, Validators.pattern('(0)[0-9]{9}')]),
        'province': new FormControl(0, [Validators.required, Validators.min(1)]),
        'district': new FormControl(0, [Validators.required, Validators.min(1)]),
        'ward': new FormControl(0, [Validators.required, Validators.min(1)]),
        'number': new FormControl('', Validators.required),
        'start_date': new FormControl(''),
        'end_date': new FormControl(''),
        // 'start_date': new FormControl('', Validators.required),
        // 'end_date': new FormControl('', Validators.required),
      })
      this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
        this.cartDetails = data as CartDetail[];
        this.cartService.setLength(this.cartDetails.length);
        if (this.cartDetails.length == 0) {
          this.router.navigate(['/']);
          this.toastr.info('Hãy chọn một vài tour du lịch rồi tiến hành thanh toán', 'Hệ thống');
        }
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

        this.amountPaypal = (this.amount/22727.5);
      });
    });
  }

  getItemDate(){let email = this.sessionService.getUser();
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
        this.cartDetails = data as CartDetail[];
        this.cartService.setLength(this.cartDetails.length);
        if (this.cartDetails.length == 0) {
          this.router.navigate(['/']);
          this.toastr.info('Hãy chọn một vài tour du lịch rồi tiến hành thanh toán', 'Hệ thống');
        }
        this.cartDetails.forEach(item=>{
          console.log("item.start_date: ",item.start_date);
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
          this.formattedStartDate = this.formatDate2(item.start_date);
          this.formattedEndDate = this.formatDate2(item.end_date);
        })
      });
    });
  }

  checkOut() {
    this.getItemDate();
    console.log("start_date: ",this.formattedStartDate);
    console.log("end_date: ",this.formattedEndDate);
    if (this.postForm.valid) {
      Swal.fire({
        title: 'Bạn có muốn đặt chuyến đi này?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Không',
        confirmButtonText: 'Đặt'
      }).then((result) => {
        if (result.isConfirmed) {
        let email = this.sessionService.getUser();
        this.cartService.getCart(email).subscribe(data => {
          this.cart = data as Cart;
          this.cart.address = this.postForm.value.number + ', ' + this.ward.name + ', ' + this.district.name + ', ' + this.province.name;
          this.cart.phone = this.postForm.value.phone;
        // this.sendingStartDate = this.postForm.value.start_date; 
        // this.sendingEndDate = this.postForm.value.end_date;   

          this.cartService.updateCart(email, this.cart).subscribe(data => {
            this.cart = data as Cart;
            this.bookService.post(email, this.cart, this.formattedStartDate, this.formattedEndDate).subscribe(data => {
              let book:Book = data as Book;
              this.sendMessage(book.bookId);
              Swal.fire(
                'Thành công!',
                'Chúc mừng bạn đã đặt chỗ thành công.',
                'success'
              )
              this.router.navigate(['/']);
            }, error => {
              this.toastr.error('Lỗi server', 'Hệ thống');
            })
          }, error => {
            this.toastr.error('Lỗi server', 'Hệ thống');
          })
        }, error => {
          this.toastr.error('Lỗi server', 'Hệ thống');
        })
      }
      })

    } else {
      this.toastr.error('Hãy nhập đầy đủ thông tin', 'Hệ thống');
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const day = date.getDate().toString().padStart(2, '0'); 
    const result = `${year}-${month}-${day}`;
    console.log("result time: ",result);
    return `${year}-${month}-${day}`;
  }
  formatDate2(dateString : Date): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

  sendMessage(id:number) {
    let chatMessage = new ChatMessage(this.cart.user.name, ' đã đặt một chuyến đi');
    this.notificationService.post(new Notification(0, this.cart.user.name + ' đã đặt chỗ ('+id+')')).subscribe(data => {
      this.webSocketService.sendMessage(chatMessage);
    })
  }

  getProvinces() {
    this.location.getAllProvinces().subscribe(data => {
      this.provinces = data as Province[];
    })
  }

  getDistricts() {
    this.location.getDistricts(this.provinceCode).subscribe(data => {
      this.province = data as Province;
      this.districts = this.province.districts;
    })
  }

  getWards() {
    this.location.getWards(this.districtCode).subscribe(data => {
      this.district = data as District;
      this.wards = this.district.wards;
    })
  }

  getWard() {
    this.location.getWard(this.wardCode).subscribe(data => {
      this.ward = data as Ward;
    })
  }

  setProvinceCode(code: any) {
    this.provinceCode = code.value;
    this.getDistricts();
  }

  setDistrictCode(code: any) {
    this.districtCode = code.value;
    this.getWards();
  }

  setWardCode(code: any) {
    this.wardCode = code.value;
    this.getWard();
  }

  private checkOutPaypal(): void {

    this.payPalConfig = {
        currency: 'USD',
        clientId: 'Af5ZEdGAlk3_OOp29nWn8_g717UNbdcbpiPIZOZgSH4Gdneqm_y_KVFiHgrIsKM0a2dhNBfFK8TIuoOG',
        createOrderOnClient: (data) => < ICreateOrderRequest > {
            intent: 'CAPTURE',
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value:String(this.amountPaypal.toFixed(2)),

                },

            }]
        },
        advanced: {
            commit: 'true'
        },
        style: {
            label: 'paypal',
            layout: 'vertical',
            color: 'blue',
            size: 'small',
            shape: 'rect',
        },
        onApprove: (data, actions) => {
            console.log('onApprove - transaction was approved, but not authorized', data, actions);
            actions.order.get().then((details: any) => {
                console.log('onApprove - you can get full order details inside onApprove: ', details);
            });

        },
        onClientAuthorization: (data) => {
            console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
            this.checkOut();
        },
        onCancel: (data, actions) => {
            console.log('OnCancel', data, actions);

        },
        onError: err => {
            console.log('OnError', err);
        },
        onClick: (data, actions) => {
            console.log('onClick', data, actions);

        },
    };
}

}
