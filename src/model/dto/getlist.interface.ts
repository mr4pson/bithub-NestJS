export interface IGetList {
    readonly sortBy?: string;
    readonly sortDir?: number;
    readonly from?: number;
    readonly q?: number;
    readonly filter?: any; // JSON
}
