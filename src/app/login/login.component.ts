import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  name!: string;

  constructor(
    private route: Router
  ){}
  
  /**
   * Funksioni qe dergon vlerat qe jep perdoruesi ne komponenetet e tjera
   */
  sendValues(){
    this.route.navigate(['/chat'],{queryParams:{name: this.name}});
  }


}
