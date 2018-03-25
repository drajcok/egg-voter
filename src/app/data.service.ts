import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Contest } from './interfaces';

@Injectable()
export class DataService {
  voter = {name: ''};
  contest: Contest;

  constructor(private http: HttpClient) {}
  getVoters() {
    return this.http.get<string>('assets/voters.txt', {responseType: 'text'});
  }
  getLoggedInVoters() {
    // TODO fix to make a real AJAX request, not reading a file
    return this.http.get<string>('assets/voters.txt?'+ new Date().getTime(),  {responseType: 'text'});
  }
  setVoter(voter: string) {
    // TODO ensure voter is not already logged in
    this.voter.name = voter;
    console.log('voter set to', this.voter);
  }
  clearVoter() {
    this.voter.name = '';
    console.log('voter cleared');
    // TODO logout user
  }
  createContest(contest: Contest) {
    return this.http.post('api/contest/new', contest);
  }
  getContestInfo() {
    // TODO fix to make a real AJAX request, not reading a file
    // return this.http.get('assets/votes/' + contest + '?'+ new Date().getTime());
    return this.http.get<Contest>('api/contest/info?' + new Date().getTime())
      .pipe(
        tap( contest => {
          // console.log('service', contest)
          this.contest = contest;
        })
      );
  }
  submitVotes(votes) {
    return this.http.post('api/contest/vote', {
      voter:   this.voter,
      contestId: 
      votes:   votes,
    });
  }
  getContestVotes(contest: string) {
    // TODO fix to make a real AJAX request, not reading a file
    //return this.http.get('assets/votes/' + contest + '?'+ new Date().getTime());
    return this.http.get('assets/votes.txt?' + new Date().getTime());
  }
  initDb() {
    this.http.post('api/initdb', '')
      .subscribe();
  }
}
