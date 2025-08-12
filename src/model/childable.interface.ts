export interface IChildable {
    id: number;
    parent_id: number;
    children: IChildable[];
    __shift: string;
    __level: number;
}
