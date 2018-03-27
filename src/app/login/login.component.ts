import { Component, OnInit } from '@angular/core';
import { DataService} from '../data.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  selectDefault = ['select your name'];
  userList      = [];
  errMsg: string;
  constructor(private dataService: DataService, private router: Router) {}
  ngOnInit() {
    // we can't clear the user in this thread of execution because the
    // main component already rendered... "expression has changed after
    // it was checked"
    setTimeout( () => {
      this.dataService.logout();
      this.dataService.getUserList()
        .subscribe(userList =>
            this.userList = this.selectDefault.concat(userList.split('\n')));
    });
  }
  login(username: string) {
    if (username === this.selectDefault[0]) {
      this.errMsg = '';
      return;
    }
    this.dataService.login(username)
      .subscribe(
        ()    => this.router.navigateByUrl('/contest'),
        (err) => {
          console.log('err', err);
          this.errMsg = `login failed: ${err.error}`;
          // TBD change selected value back to default
        }
      );
  }
}
