import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Category } from 'src/app/common/Category';
import { Customer } from 'src/app/common/Customer';
import { Favorites } from 'src/app/common/Favorites';
import { Tour } from 'src/app/common/Tour';
import { Rate } from 'src/app/common/Rate';
import { CartService } from 'src/app/services/cart.service';
import { CategoryService } from 'src/app/services/category.service';
import { CustomerService } from 'src/app/services/customer.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { TourService } from 'src/app/services/tour.service';
import { RateService } from 'src/app/services/rate.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-by-category',
  templateUrl: './by-category.component.html',
  styleUrls: ['./by-category.component.css']
})
export class ByCategoryComponent implements OnInit {

  tours!: Tour[];
  id!: number;

  customer!: Customer;
  favorite!: Favorites;
  favorites!: Favorites[];
  categories!: Category[];

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  
  page: number = 1;

  isLoading = true;

  key: string = '';
  keyF: string = '';
  reverse: boolean = true;

  rates!: Rate[];
  countRate!: number;
  imagesByCategory: { [key: number]: string } = {};
  selectedImage: string = '';
  // imagesByCategory: { [key: number]: string } = {
  //   1: 'img/slider/home-3/home-banner/slide-9.jpg',   // Image for "Miền Bắc"
  //   2: 'img/slider/home-3/home-banner/promotion-5.jpg', // Image for "Miền Trung"
  //   3: 'img/slider/home-3/home-banner/promotion-4.jpg',   // Image for "Miền Nam"
  //   4: 'img/slider/home-3/home-banner/sea.jpg',     // Image for "biển"
  //   5: 'img/slider/home-3/home-banner/mountain.jpg' // Image for "núi"
  // };

  constructor(
    private tourService: TourService,
    private cartService: CartService,
    private router: Router,
    private rateService: RateService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private favoriteService: FavoritesService,
    private sessionService: SessionService,
    private categoryService : CategoryService) {
    route.params.subscribe(val => {
      this.ngOnInit();
    })
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    console.log(this.id); 
    console.log("ảnh đây: ",this.imagesByCategory);
    this.imagesByCategory = {
      1: 'assets/img/slider/home-3/home-banner/1.jpg',   // Image for "Miền Bắc"
      2: 'assets/img/slider/home-3/home-banner/2.jpg', // Image for "Miền Trung"
      3: 'assets/img/slider/home-3/home-banner/3.jpg',   // Image for "Miền Nam"
      4: 'assets/img/slider/home-3/home-banner/sea.jpg',     // Image for "biển"
      5: 'assets/img/slider/home-3/home-banner/mountain.jpg' // Image for "núi"
    };
    this.selectedImage = this.imagesByCategory[this.id];
    this.getTours();
    this.getAllRate();
    this.getCategories();
  }

  getCategories() {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data as Category[];
    })
  }

  getAllRate() {
    this.rateService.getAll().subscribe(data => {
      this.rates = data as Rate[];
    })
  }

  getAvgRate(id: number): number {
    let avgRating: number = 0;
    this.countRate = 0;
    for (const item of this.rates) {
      if (item.tour.tourId === id) {
        avgRating += item.rating;
        this.countRate++;
      }
    }
    return Math.round(avgRating/this.countRate * 10) / 10;
  }

  getTours() {
    this.tourService.getByCategory(this.id).subscribe(data => {
      this.isLoading = false;
      this.tours = data as Tour[];
    }, error => {
      this.toastr.error('Tour không tồn tại!', 'Hệ thống');
      this.router.navigate(['/home'])
    })
  }

  toggleLike(id: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Hãy đăng nhập để sử dụng dịch vụ của chúng tôi', 'Hệ thống');
      return;
    }
    this.favoriteService.getByTourIdAndEmail(id, email).subscribe(data => {
      if (data == null) {
        this.customerService.getByEmail(email).subscribe(data => {
          this.customer = data as Customer;
          this.favoriteService.post(new Favorites(0, new Customer(this.customer.userId), new Tour(id))).subscribe(data => {
            this.toastr.success('Thêm thành công!', 'Hệ thống');
            this.favoriteService.getByEmail(email).subscribe(data => {
              this.favorites = data as Favorites[];
              this.favoriteService.setLength(this.favorites.length);
            }, error => {
              this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
            })
          }, error => {
            this.toastr.error('Thêm thất bại!', 'Hệ thống');
          })
        })
      } else {
        this.favorite = data as Favorites;
        this.favoriteService.delete(this.favorite.favoriteId).subscribe(data => {
          this.toastr.info('Đã xoá ra khỏi danh sách yêu thích!', 'Hệ thống');
          this.favoriteService.getByEmail(email).subscribe(data => {
            this.favorites = data as Favorites[];
            this.favoriteService.setLength(this.favorites.length);
          }, error => {
            this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
          })
        }, error => {
          this.toastr.error('Lỗi!', 'Hệ thống');
        })
      }
    })
  }

  sort(keyF: string) {
    if (keyF === 'enteredDate') {
      this.key = 'enteredDate';
      this.reverse = true;
    } else
      if (keyF === 'priceDesc') {
        this.key = '';
        this.tours.sort((a,b)=>b.price-a.price);
      } else
        if (keyF === 'priceAsc') {
          this.key = '';
          this.tours.sort((a,b)=>a.price-b.price);
        }
        else {
          this.key = '';
          this.getTours();
        }
  }

  addCart(tourId: number, price: number) {
    let email = this.sessionService.getUser();
    if (email == null) {
      this.router.navigate(['/sign-form']);
      this.toastr.info('Hãy đăng nhập để sử dụng dịch vụ của chúng tôi', 'Hệ thống');
      return;
    }
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;

      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var tempStartDate = { year: yyyy, month: mm, day: dd };
      const start_date = new Date(tempStartDate.year, tempStartDate.month - 1, tempStartDate.day);

      var today = new Date();
      var dd = today.getDate() + 1;
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var tempEndDate = { year: yyyy, month: mm, day: dd };
      const end_date = new Date(tempEndDate.year, tempEndDate.month - 1, tempEndDate.day); 

      this.cartDetail = new CartDetail(0, 1, price, new Tour(tourId), new Cart(this.cart.cartId), start_date, end_date);
      this.cartService.postDetail(this.cartDetail).subscribe(data => {
        this.toastr.success('Thêm vào giỏ hàng thành công!', 'Hệ thống!');
        this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
          this.cartDetails = data as CartDetail[];
          this.cartService.setLength(this.cartDetails.length);
        })
      }, error => {
        this.toastr.error('Tour du lịch này có thể đã hết chỗ!', 'Hệ thống');
        this.router.navigate(['/home']);
        window.location.href = "/";
      })
    })
  }

}
