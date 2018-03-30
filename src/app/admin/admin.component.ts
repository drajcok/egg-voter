import { Component, OnInit } from '@angular/core';
import { DataService} from '../data.service';
import { Contest, ContestResults } from '../interfaces';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  showDbStuff = false;
  showDelete  = false;
  users       = [];
  state       = 'init';
  contest:        Contest;
  errMsg:         string;
  ballotMsg:      string;
  contestResults: ContestResults;

  constructor(private dataService: DataService) { }
  ngOnInit() {
    this.getLoggedInUsers();
    this.dataService.getActiveContest()
      .subscribe(
        (contest) => {
          if (contest === null) {
            this.contest = new Contest(null, '', 0, 0, 0);
            this.state   = 'noContestActive';
          } else {
            this.contest = contest;
            this.state   = 'contestActive';
            this.getContestResults();
          }
        },
        err => console.log(err)
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
    this.errMsg = null;
    // console.log(this.contest);
    if (this.contest.ballotSlots < 1 || this.contest.ballotSlots === undefined
        || this.contest.ballotCount < 1 || this.contest.ballotCount === undefined
        || this.contest.name.length === 0) {
      // TBD error on form
      return;
    }
    this.contest.active = 1;
    this.dataService.createContest(this.contest)
      .subscribe(
        (data: any) => {
          this.state = 'contestActive';
          this.contest.id = data.id;
          console.log('data:', data);
        },
        err  => {
          console.log(err);
          this.errMsg = JSON.stringify(err);
        }
      );
  }
  clearContest() {
    this.state   = 'noContestActive';
    this.contest = new Contest(null, '', 0, 0, 1);
    this.contestResults = null;
  }
  closeContest() {
    this.contest.active = 0;
    this.dataService.closeContest(this.contest)
      .subscribe(
        ()  => this.clearContest(),
        err => console.log(err)
      );
  }
  deleteContest() {
    this.dataService.deleteContest(this.contest)
      .subscribe(
        ()  => this.clearContest(),
        err => console.log(err)
      );
  }
  getContestResults() {
    this.dataService.getContestResults(this.contest)
      .subscribe( results => {
        this.ballotMsg = `${results.voters.length} of ${this.contest.ballotCount} `
            + 'ballots cast by ' + results.voters.join(', ');
        console.log(results)
        this.contestResults = results;
        // this.contest.votes     = voteInfo.votes;
      });
  }
}
