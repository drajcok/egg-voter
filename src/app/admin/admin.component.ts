import { Component, OnInit } from '@angular/core';
import { DataService} from '../data.service';
import { Vote, Contest } from '../interfaces';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  showDbStuff = true;
  users       = [];
  state       = 'init';
  contest: Contest;
  votes:   Array<Vote>;

  constructor(private dataService: DataService) { }
  ngOnInit() {
    this.getLoggedInUsers();
    this.dataService.getContestInfo()
      .subscribe(
        (contest) => {
          this.contest = contest;
          this.state   = 'contestActive';
          this.getContestResults(); },
        err       => {
          this.contest = new Contest(null, 'Adults - Round 1', 5, 0);
          this.state   = 'noContestActive'; }
      );
  }
  getLoggedInUsers() {
    this.dataService.getLoggedInUsers()
      .subscribe( users => this.users = users);
  }
  initDb() {
    this.dataService.initDb();
  }
  logoutUser(username: string) {
    this.dataService.logoutUser(username);
    setTimeout(() => this.getLoggedInUsers(), 1000);  // hack
  }
  createContest() {
    // console.log(this.contest);
    if (this.contest.ballotSlots < 1 || this.contest.ballotSlots === undefined
     || this.contest.name.length === 0) {
      // TBD error on form
      return;
    }
    this.dataService.createContest(this.contest)
      .subscribe(
        data => {
          this.state = 'contestActive';
          console.log('row ID', data.id);
        },
        err  => console.log(err)
      );
  }
  closeContest() {
    this.state   = 'noContestActive';
    this.contest = null;
  }
  deleteContest() {
    console.log('TODO');
    this.closeContest();
  }
  getContestResults() {
    this.dataService.getContestResults(this.contest)
      .subscribe( results => {
        console.log(results)
        this.contest.ballotsCast = results.ballotsCast;
        this.votes = results.votes;
        // this.contest.votes     = voteInfo.votes;
      });
  }
}
