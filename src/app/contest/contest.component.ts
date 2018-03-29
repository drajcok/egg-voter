import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { User, Contest } from '../interfaces';
import { Router } from '@angular/router';

@Component({
  templateUrl: './contest.component.html',
  styleUrls: ['./contest.component.scss']
})
export class ContestComponent implements OnInit {
  maxEggCount       = 50;
  pollingPeriod     = 1 * 1000;  // 5 seconds
  state             = 'waitingForContestStart';
  user:      User;
  contest:   Contest;
  votes:     Array<number>;
  errorMsg:  string;

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
        .subscribe( contest => {
          this.errorMsg  = null;
          if (contest === null) { return; }
          clearInterval(timerId);
          console.log('contest', contest)
          this.contest = contest;
          this.dataService.getVotes(this.user, this.contest)
            .subscribe( votes => {
              if (votes === null) {
                this.state = 'voting';
                this.votes = [1,2,3,4,5]; /////Array(contest.ballotSlots);
              } else {
                this.state = 'voted';
                console.log('votes:', votes)
                this.votes = votes;
                this.pollForContestResults();
              }
            });
         });
      // console.log('polling', new Date);
    }, this.pollingPeriod);
  }
  castBallot() {
    console.log('votes', this.votes)
    if (!this.votes.every( vote => vote > 0 && vote <= this.maxEggCount )) {
      this.errorMsg = 'Something looks wrong with your votes.  Are they all numbers?';
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
      .subscribe(
        ()  => console.log('ballot cast'),
        err => console.log(err)
      );
  }
  pollForContestResults() {
    const timerId = setInterval( () => {
      this.dataService.getContestResults(this.contest)
        .subscribe( results => {
          console.log(results)
          this.ballotsMsg = `${results.ballotsCast} ballots cast out of ${results.ballotCount}`;
          if (results.ballotCount === results.ballotsCast) {
            clearInterval(timerId);
            this.results = results;
          }
         });
    }, 5000);
  }
}
