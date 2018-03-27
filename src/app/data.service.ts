import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { User, Contest } from './interfaces';

@Injectable()
export class DataService {
  user = new User('');  // do not create another User... components have a reference to this one
  contest: Contest;

  constructor(private http: HttpClient) {}
  getUserList() {
    return this.http.get<string>('api/user_list', {responseType: 'text'} );
  }
  getLoggedInUsers() {
    return this.http.post<string[]>('api/loggedin_users', null);
  }
  login(username: string) {
    return this.http.post<string>('api/login', { name: username }, {responseType: 'text'} )
      .pipe(
        tap( () => this.user.name = username )
      );
  }
  logout() {
    if (this.user.name) {
      this.http.post('api/logout', this.user, {responseType: 'text'})
        .subscribe();
      this.user.name = '';
    }
  }
  logoutUser(username: string) {  // admin capability
    const user = new User(username);
    this.http.post('api/logout', user, {responseType: 'text'})
        .subscribe();
  }
  createContest(contest: Contest) {
    return this.http.post('api/create_contest', contest);
  }
  getContestInfo() {
    return this.http.post<Contest>('api/contest_info', null)
      .pipe(
        tap( contest => {
          // console.log('service', contest)
          this.contest = contest;
        })
      );
  }
  submitBallot(contest, votes) {
    return this.http.post('api/cast_vote', {
      user:   this.user,
      contestId: 
      votes:   votes,
    });
  }
  getBallotsCastCount(contest: Contest) {
    return this.http.post('api/ballots_cast', contest);
  }
  getContestResults(contest: Contest) {
    return this.http.post('api/contest_results', contest);
  }
  initDb() {
    this.http.post('api/initdb', '')
      .subscribe();
  }
}
