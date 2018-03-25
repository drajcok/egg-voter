import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'egg-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  voter: Object;
  constructor(private dataService: DataService) {}
  ngOnInit() {
    this.voter = this.dataService.voter;
  }
}
