import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { User, Vote, Contest, ContestResults } from './interfaces';

@Injectable()
export class DataService {
  // user = new User('Mark');  // DEBUG
  user = new User('');  // do not create another User... components have a reference to this one

  constructor(private http: HttpClient) {}
  getUserList() {
    return this.http.get('api/user_list', { responseType: 'text' });
  }
  getLoggedInUsers() {
    return this.http.get<string[]>('api/loggedin_users');
  }
  login(username: string) {
    return this.http.post('api/login', { name: username }, {responseType: 'text'} )
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
    return this.http.post('api/contest', contest);
  }
  deleteContest(contest: Contest) {
    return this.http.delete(`api/contest/${contest.id}`);
  }
  closeContest(contest: Contest) {
    // if (contest.active !== 0) { console.log('error'); }
    return this.http.put(`api/contest/${contest.id}`, contest, {responseType: 'text'});
  }
  getActiveContest() {
    return this.http.get<Contest>('api/contest')
      .pipe(
        tap( contest => {
          // console.log('service', contest)
          // this.contest = contest;
        })
      );
  }
  getBallot(user, contest) {
    return this.http.get<Vote[]>(`api/ballot/${user.name}/${contest.id}`);
  }
  castBallot(user, contest, votes) {
    return this.http.post('api/ballot', {
      username:   user.name,
      contestId:  contest.id,
      votes:      votes
    }, {responseType: 'text'});
  }
  getContestResults(contest: Contest) {
    return this.http.get<ContestResults>(`api/contest_results/${contest.id}`);
  }
  initDb() {
    this.http.post('api/initdb', '')
      .subscribe();
  }
}
