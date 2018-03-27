import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { User } from './interfaces';

@Component({
  selector: 'egg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User;
  constructor(private dataService: DataService) {}
  ngOnInit() {
    this.user = this.dataService.user;
  }
}
