export interface IDailerSave {
    readonly id?: number;
    readonly name: string;
    readonly link: string;
    readonly comment: string;
    readonly completed?: boolean;
}
