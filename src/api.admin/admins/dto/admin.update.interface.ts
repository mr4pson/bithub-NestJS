export interface IAdminUpdate {    
    readonly id: number;
    readonly group_id: number; 
    readonly name: string;
    readonly email: string;
    readonly password: string; 
    readonly img: string;    
    readonly active: boolean;     
    readonly defended: boolean;   
    readonly hidden: boolean;
}
