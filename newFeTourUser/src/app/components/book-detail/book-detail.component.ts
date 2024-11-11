import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Book } from 'src/app/common/Book';
import { BookDetail } from 'src/app/common/BookDetail';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrls: ['./book-detail.component.css']
})
export class BookDetailComponent implements OnInit {

  bookDetails!:BookDetail[];
  book!:Book;

  @Input() id!:number;

  constructor(private modalService: NgbModal, private bookService: BookService, private toastr: ToastrService, ) { }

  ngOnInit(): void {
    this.getBook();
    this.getItems();
  }

  getBook() {
    this.bookService.getById(this.id).subscribe(data=>{
      this.book = data as Book;
    },error=>{
      this.toastr.error('Lỗi server', 'Hệ thống');
    })
  }

  getItems() {
    this.bookService.getByBook(this.id).subscribe(data=>{
      this.bookDetails = data as BookDetail[];      
    },error=>{
      this.toastr.error('Lỗi server', 'Hệ thống');
    })
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content, {centered: true, size: 'lg'})
  }

  finish() {
    this.ngOnInit();
  }

}
