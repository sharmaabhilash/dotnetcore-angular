import { Component, OnInit } from '@angular/core';
import { ValueService } from './value.service';

@Component({
  selector: 'app-value',
  templateUrl: './value.component.html',
  styleUrls: ['./value.component.css']
})
export class ValueComponent implements OnInit {

  values: any;

  constructor(private valueService: ValueService) { }

  ngOnInit() {
    this.getValuesFromService();
  }

  getValuesFromService() {
    this.valueService.getValues().subscribe(response => this.apiResponse(response), error => this.apiError(error));
  }

  apiResponse(response) {
    this.values = response;
  }

  apiError(error) {
    console.log(error);
  }
}
