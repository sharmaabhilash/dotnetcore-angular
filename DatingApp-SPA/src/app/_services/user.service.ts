import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getUsers(page?, itemsPerPage?, userParams?, likeParams?): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

    let params = new HttpParams();

    if(page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }
    if(userParams != null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    if(likeParams === 'Likers') {
      params = params.append('likers', 'true');
    }

    if(likeParams === 'Likees') {
      params = params.append('likees', 'true');
    }

    return this.http.get<User[]>(this.baseUrl + environment.getusers, { observe: 'response', params })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'))
          }
          return paginatedResult;
        })
      );
  }
  
  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + environment.getuser + id);
  }

  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + environment.updateusers + id, user);
  }

  setMainPhoto(userId: number, id: number) {
    let url = this.baseUrl + environment.usersUrl + userId + environment.photoUrl + '/' + id + environment.setMainUrl;
    return this.http.post(url, {});
  }
  
  deletePhotos(userId: number, id: number) {
    let url = this.baseUrl + environment.usersUrl + userId + environment.photoUrl + '/' + id;
    return this.http.delete(url);
  }

  sendLike(userId: number, recipientId: number) {
    let url = this.baseUrl + environment.usersUrl + userId + environment.likeUrl + recipientId;
    return this.http.post(url, {});
  }
}
