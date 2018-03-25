import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Voter, Contest } from '../interfaces';
import { Router } from '@angular/router';

@Component({
  templateUrl: './contest.component.html',
  styleUrls: ['./contest.component.scss']
})
export class ContestComponent implements OnInit {
  maxEggCount       = 50;
  pollingPeriod     = 5 * 1000;  // 5 seconds
  waitingForContest = true;
  voter:     Voter;
  contest:   Contest;
  votes:     Array<number>;
  errorMsg:  string;

  constructor(private dataService: DataService, private router: Router) {}
  ngOnInit() {
    this.voter = this.dataService.voter;
    if (!this.voter.name) {
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
      this.dataService.getContestInfo()
        .subscribe( contest => {
          if(contest === null) { return; }
          console.log('contest', contest)
          this.contest           = contest;
          this.waitingForContest = false;
          this.votes             = Array(contest.ballotSlots);
          this.errorMsg          = null;
          clearInterval(timerId);
         });
      // console.log('polling', new Date);
    }, this.pollingPeriod);
  }
  submitVotes() {
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
    this.dataService.submitVotes(this.votes);
  }
  pollForContestResults() {
    const timerId = setInterval( () => {
      this.dataService.getContestResults()
        .subscribe( results => {
          // TBD
          clearInterval(timerId);
         });
      console.log(new Date);
    }, 5000);
  }
}
