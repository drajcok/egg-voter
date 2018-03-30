import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DataService } from './data.service';
import { User } from './interfaces';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'egg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User;
  url:  string;
  constructor(private dataService: DataService, private router: Router) {}
  ngOnInit() {
    this.user = this.dataService.user;
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe( (event: any) => this.url = event.url);
    if (location.pathname !== '/admin') {
      if (!this.user.name) {
        this.router.navigateByUrl('login');
      } else {
        this.router.navigateByUrl('contest');
      }
    }
  }
}
