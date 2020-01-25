import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @Input() valuesFromHome: any;
  @Output() cancelRegister = new EventEmitter();

  registerModel: User;
  registerForm: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(private authService: AuthenticationService, 
    private alertify: AlertifyService,
    private formBuilder: FormBuilder) {  }

  ngOnInit() {
    // this.registerForm = new FormGroup({
    //   username: new FormControl('', Validators.required),
    //   password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
    //   confirmPassword: new FormControl('', Validators.required)
    // }, this.passwordMatchValidator);
    this.bsConfig = {
      containerClass: 'theme-default'
    };
    this.createRegisterForm();
  }

  createRegisterForm() {
    this.registerForm = this.formBuilder.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confirmPassword').value ? null : { 'mismatch': true };
  }

  registerUser() {
    if(this.registerForm.valid) {
      this.registerModel = Object.assign({}, this.registerForm.value);
      this.authService.registerUser(this.registerModel).subscribe(response => {
        this.alertify.success('Registration successfully');
      }, error => {
        this.alertify.error(error);
      });
    }
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
