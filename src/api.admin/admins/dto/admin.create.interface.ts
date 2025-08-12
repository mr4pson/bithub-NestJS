export interface IAdminCreate {   
    readonly group_id: number; 
    readonly name: string;
    readonly email: string;
    readonly password: string; 
    readonly img: string;    
    readonly active: boolean;    
}
