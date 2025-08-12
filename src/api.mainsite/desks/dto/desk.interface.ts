export interface IDesk {
    readonly id: number;
    readonly name: string;
    readonly problems: IDeskProblem[];
}

export class IDeskProblem {
    readonly id: number;
    readonly desk_id: number;
    readonly content: string;
    readonly actual_until: string;
    readonly created_at: Date;
    readonly has_unviewed_comments: boolean;
    readonly user: IDeskProblemUser;
    readonly guide: IDeskProblemGuide;    
}

export class IDeskProblemUser {
    readonly id: number;
    readonly name: string;
    readonly img: string;
}

export class IDeskProblemGuide {
    readonly id: number;
    readonly img: string;
}
