import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { User, Vote, Contest, ContestResults } from '../interfaces';
import { Router } from '@angular/router';

@Component({
  templateUrl: './contest.component.html',
  styleUrls: ['./contest.component.scss']
})
export class ContestComponent implements OnInit {
  maxEggCount   = 50;
  pollingPeriod = 5 * 1000;  // 5 seconds
  state         = 'waitingForContestStart';
  user:           User;
  contest:        Contest;
  votes:          Array<number>;
  errorMsg:       string;
  ballotsMsg:     string;
  contestResults: ContestResults = null;

  constructor(private dataService: DataService, private router: Router) {}
  ngOnInit() {
    this.user = this.dataService.user;
    if (!this.user.name) {
      this.router.navigateByUrl('/');
    } else {
      this.pollForActiveContest();
    }
  }
  trackByIndex(index: number, value: number) {
    return index;
  }
  pollForActiveContest() {
    const timerId = setInterval( () => {
      this.dataService.getActiveContest()
        .subscribe( (contest: Contest) => {
          this.errorMsg = null;
          if (contest === null) { return; }
          clearInterval(timerId);
          console.log('contest', contest);
          this.contest = contest;
          this.dataService.getBallot(this.user, this.contest)
            .subscribe( (ballot: Array<Vote>) => {
              console.log('ballot:', ballot);
              if (ballot === null || ballot.length === 0) {
                this.state = 'voting';
                this.votes = Array(contest.ballotSlots);
              } else {
                this.state = 'voted';
                this.votes = ballot.map( vote => vote.itemId );
                this.pollForContestResults();
              }
            });
         });
      // console.log('polling', new Date);
    }, this.pollingPeriod);
  }
  castBallot() {
    console.log('votes', this.votes)
    if (!this.votes.every( vote => vote > 0 && vote <= this.maxEggCount && vote !== null && typeof vote !== 'undefined' )) {
      this.errorMsg = 'Something looks wrong with your votes.  Are they all valid egg numbers?';
      return;
    }
    const uniqueIds = Array.from(new Set(this.votes));
    console.log('uniqueIds', uniqueIds)
    if (uniqueIds.length !== this.votes.length) {
      this.errorMsg = `You need to vote for ${this.contest.ballotSlots} <i>different</i> eggs.`;
      return;
    }
    this.errorMsg = null;
    this.dataService.castBallot(this.user, this.contest, this.votes)
      .subscribe( () => {
          console.log('ballot cast');
          this.state = 'voted';
          this.pollForContestResults();
        },
        err => {
          console.log(err)
          this.errorMsg = err.error;
        }
      );
  }
  pollForContestResults() {
    const timerId = setInterval( () => {
      this.dataService.getContestResults(this.contest)
        .subscribe( (results: ContestResults) => {
          console.log(results)
          this.ballotsMsg = `${results.voters.length} of ${this.contest.ballotCount} `
            + 'ballots cast by ' + results.voters.join(', ');
          if (results.votes.length > 0) {
            clearInterval(timerId);
            this.contestResults = results;
          }
         });
    }, 5000);
  }
}
