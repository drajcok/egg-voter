export class User {
    constructor(public name: string) {}
}
export class Vote {
    constructor(public id: number, public votes: number) {}
}
export class Contest {
    constructor(public id: number,
                public name: string,
                public ballotSlots: number,     // how many eggs to vote for
                public ballotsCast: number) {}  // how many ballots have been received
}
