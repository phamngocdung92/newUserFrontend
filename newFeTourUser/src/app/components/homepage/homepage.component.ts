import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import { CartDetail } from 'src/app/common/CartDetail';
import { Customer } from 'src/app/common/Customer';
import { Favorites } from 'src/app/common/Favorites';
import { Tour } from 'src/app/common/Tour';
import { Rate } from 'src/app/common/Rate';
import { CartService } from 'src/app/services/cart.service';
import { CustomerService } from 'src/app/services/customer.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { TourService } from 'src/app/services/tour.service';
import { RateService } from 'src/app/services/rate.service';
import { SessionService } from 'src/app/services/session.service';
// import { NavigationEnd, Router } from '@angular/router';
@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  tourSeller!:Tour[];
  tourLatest!:Tour[];
  tourRated!:Tour[];

  isLoading = true;

  customer!: Customer;
  favorite!: Favorites;
  favorites!: Favorites[];

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];
  
  rates!: Rate[];
  countRate!: number;

  slideConfig = {"slidesToShow": 7, "slidesToScroll": 2, "autoplay": true};

  constructor(
    private tourService: TourService,
    private cartService: CartService,
    private customerService: CustomerService,
    private rateService: RateService,
    private toastr: ToastrService,
    private favoriteService: FavoritesService,
    private sessionService: SessionService,
    private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });
    this.getAllTourBestSeller();
    this.getAllTourLatest();
    this.getAllTourRated();
    this.getAllRate();
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

  getAllTourBestSeller() {
    this.tourService.getBestSeller().subscribe(data=>{
      this.tourSeller = data as Tour[];
      this.isLoading = false;
    }, error=>{
      this.toastr.error('Lỗi server!', 'Hệ thống')   
      console.log(error);   
    })
  }

  getAllTourLatest() {
    this.tourService.getLasted().subscribe(data=>{
      this.tourLatest = data as Tour[];
      this.isLoading = false;
    }, error=>{
      this.toastr.error('Lỗi server!', 'Hệ thống')  
      console.log(error);    
    })
  }

  getAllTourRated() {
    this.tourService.getRated().subscribe(data=>{
      this.tourRated = data as Tour[];
      this.isLoading = false;
    }, error=>{
      this.toastr.error('Lỗi server!', 'Hệ thống')   
      console.log(error);
         
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
            this.favoriteService.getByEmail(email).subscribe(data=>{
              this.favorites = data as Favorites[];
              this.favoriteService.setLength(this.favorites.length);
            }, error=>{
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
          this.favoriteService.getByEmail(email).subscribe(data=>{
            this.favorites = data as Favorites[];
            this.favoriteService.setLength(this.favorites.length);
          }, error=>{
            this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
          })
        }, error => {
          this.toastr.error('Lỗi!', 'Hệ thống');
        })
      }
    })
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
