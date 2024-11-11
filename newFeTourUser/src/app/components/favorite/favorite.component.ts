import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cart } from 'src/app/common/Cart';
import Swal from 'sweetalert2';
import { CartDetail } from 'src/app/common/CartDetail';
import { Favorites } from 'src/app/common/Favorites';
import { CartService } from 'src/app/services/cart.service';
import { FavoritesService } from 'src/app/services/favorites.service';
import { SessionService } from 'src/app/services/session.service';
import { Tour } from 'src/app/common/Tour';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {

  favorites!:Favorites[];

  cart!: Cart;
  cartDetail!: CartDetail;
  cartDetails!: CartDetail[];

  page: number = 1;

  constructor(private toastr: ToastrService,
    private cartService: CartService,
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
    this.getAll();
  }

  getAll() {
    let email = this.sessionService.getUser();
    this.favoriteService.getByEmail(email).subscribe(data=>{
      this.favorites = data as Favorites[];
      this.favoriteService.setLength(this.favorites.length);
    }, error=>{
      this.toastr.error('Lỗi server', 'Hệ thống');
    })
  }

  delete(id: number, name: string) {
    Swal.fire({
      title: 'Bạn muốn xoá tour du lịch ' + name + ' ra khỏi danh sách yêu thích ?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Xoá',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.isConfirmed) {
        this.favoriteService.delete(id).subscribe(data=>{
          this.toastr.info('Đã xoá ra khỏi danh sách yêu thích!', 'Hệ thống');
          this.ngOnInit();
        }, error=>{
          this.toastr.error('Lỗi', 'Hệ thống');
          this.ngOnInit();
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
