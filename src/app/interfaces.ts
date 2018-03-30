// this file used to contain only interfaces, then I started adding classes

export class User {
    constructor(public name: string) {}
}
export interface Vote {
    id:        number;
    contestId: number;
    voter:     string;
    itemId:    number;
}
export class Contest {
    constructor(public id:          number,
                public name:        string,
                public ballotSlots: number,  // how many eggs to vote for
                public ballotCount: number,  // how many ballots/voters
                public active:      number ) {}
}
export interface VoteCount {
    itemId:  number;
    votes:   number;
}
export interface ContestResults {
    voters: string[];
    votes:  Array<VoteCount>;
}
