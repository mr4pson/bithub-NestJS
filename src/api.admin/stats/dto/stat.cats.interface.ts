export interface IStatCats {
    total: number;
    cats: IStatCat[]; 
}

export interface IStatCat {
    name: string;
    q: number;
    percent: number;
}