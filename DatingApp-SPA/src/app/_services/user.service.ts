import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../_models/pagination';
import { map } from 'rxjs/operators';
import { Message } from '../_models/message';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getUsers(page?, itemsPerPage?, userParams?, likeParams?): Observable<PaginatedResult<User[]>> {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();

    let params = new HttpParams();

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }
    if (userParams != null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    if (likeParams === 'Likers') {
      params = params.append('likers', 'true');
    }

    if (likeParams === 'Likees') {
      params = params.append('likees', 'true');
    }

    return this.http.get<User[]>(this.baseUrl + environment.getusers, { observe: 'response', params })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
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
    const url = this.baseUrl + environment.usersUrl + userId + environment.photoUrl + '/' + id + environment.setMainUrl;
    return this.http.post(url, {});
  }

  deletePhotos(userId: number, id: number) {
    const url = this.baseUrl + environment.usersUrl + userId + environment.photoUrl + '/' + id;
    return this.http.delete(url);
  }

  sendLike(userId: number, recipientId: number) {
    const url = this.baseUrl + environment.usersUrl + userId + environment.likeUrl + recipientId;
    return this.http.post(url, {});
  }

  getMessages(id: number, page?, itemsPerPage?, messageContainer?) {
    const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>();

    let params = new HttpParams();

    params = params.append('MessageContainer', messageContainer);

    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    const url = environment.baseUrl + environment.usersUrl + id + environment.messagesUrl;

    return this.http.get<Message[]>(url, { observe: 'response',  params })
      .pipe(
        map(response => {
          paginatedResult.result = response.body;
          if (response.headers.get('Pagination') !== null) {
            paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
          }
          return paginatedResult;
        })
      );
  }

  getMessageThread(userId: number, recipientId: number) {
    const url = environment.baseUrl + environment.usersUrl + userId + environment.messagesUrl + environment.threadUrl + recipientId;
    return this.http.get<Message[]>(url);
  }

  sendMessage(userId: number, message: Message) {
    const url = environment.baseUrl + environment.usersUrl + userId + environment.messagesUrl;
    return this.http.post(url, message);
  }

  deleteMessage(id: number, userId: number) {
    const url = environment.baseUrl + environment.usersUrl + userId + environment.messagesUrl + '/' + id;
    return this.http.post(url, {});
  }

  markAsRead(userId: number, messageId: number) {
    const url = environment.baseUrl + environment.usersUrl + userId + environment.messagesUrl + messageId + environment.readUrl;
    this.http.post(url, {}).subscribe();
  }
}
