import { Component, OnInit } from '@angular/core';
import { DataService} from '../data.service';
import { Vote, Contest } from '../interfaces';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  showDbStuff   = true;
  users         = [];
  contestActive = false;
  contest: Contest;
  votes: Array<Vote>;

  constructor(private dataService: DataService) { }
  ngOnInit() {
    this.getActiveUsers();
    this.contest = new Contest(null, 'Adults - Round 1', 5, 0, 0);
  }
  getActiveUsers() {
    this.dataService.getLoggedInVoters()
      .subscribe( users =>  // users is a string, one name per line
        this.users = users.split('\n') );
  }
  initDb() {
    this.dataService.initDb();
  }
  createContest() {
    // console.log(this.contest);
    if (this.contest.ballotSlots < 1 || this.contest.ballotSlots === undefined
     || this.contest.name.length === 0) {
      // TBD error on form
      return;
    }
    this.contest.ballotsCount = this.users.length;
    this.dataService.createContest(this.contest)
      .subscribe(
        data => {
          this.contestActive = true;
          console.log('row ID', data.id);
        },
        err  => console.log(err)
      );
  }
  closeContest() {
    this.contestActive = false;
    this.contest       = null;
  }
  deleteContest() {
    console.log('TODO');
    this.closeContest();
  }
  getVotes() {
    this.dataService.getContestVotes(this.contest.name)
      .subscribe( votes => {
        this.votes = votes;
        // this.contest.votes     = voteInfo.votes;
        console.log(votes)
      });
  }
}
