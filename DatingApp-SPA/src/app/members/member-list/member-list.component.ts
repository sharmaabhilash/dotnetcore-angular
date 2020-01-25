import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/user';
import { AlertifyService } from '../../_services/alertify.service';
import { UserService } from '../../_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { Pagination, PaginatedResult } from 'src/app/_models/pagination';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  usersList: User[];
  pagination: Pagination;
  user: User;
  genderList = new Array();
  userParams: any = {};

  constructor(private userService: UserService, private alertify: AlertifyService, private route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'));
    this.genderList = [{ value: 'male', display: 'Males' }, { value: 'female', display: 'Females' }];
   }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.usersList = data['users'].result;
      console.log(data['users'].pagination);
      this.pagination = data['users'].pagination;
    });
    this.userParams.gender = this.user.gender == 'male' ? 'female' : 'male';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.orderBy = 'lastActive';
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
      .subscribe((res: PaginatedResult<User[]>) => {
        this.usersList = res.result;
        this.pagination = res.pagination;
      }, error => {
        this.alertify.error(error);
      })
  }

  resetFilters() {
    this.userParams.gender = this.user.gender == 'male' ? 'female' : 'male';
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.loadUsers();
  }
}
