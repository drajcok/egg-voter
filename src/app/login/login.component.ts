import { Component, OnInit } from '@angular/core';
import { DataService} from '../data.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  selectDefault = ['select your name'];
  voters = [];
  constructor(private dataService: DataService, private router: Router) {}
  ngOnInit() {
    // we can't clear the voter in this thread of execution because the
    // main component already rendered... "expression has changed after
    // it was checked"
    setTimeout( () => {
      this.dataService.clearVoter();  // logout
      this.dataService.getVoters()
        .subscribe(voters =>
            this.voters = this.selectDefault.concat(voters.split('\n')));
    });
  }
  login(voter: string) {
    // TODO verify on server that this voter is not already logged in!
    if (voter === this.selectDefault[0]) { return; }
    this.dataService.setVoter(voter);
    this.router.navigateByUrl('/contest');
  }
}
