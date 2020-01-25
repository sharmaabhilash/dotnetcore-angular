import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValueService {

  constructor(private http: HttpClient) { }

  getValues() {
    let url = environment.baseUrl + environment.getAllValueUrl;
    return this.http.get(url);
  }
}
