import { Column, PrimaryGeneratedColumn } from "typeorm";

export abstract class CEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({nullable: false, default: false})
    public defended: boolean;  
    
    /////////////////
    // utils
    /////////////////

    protected random(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    protected randomString(length: number, mode: "full" | "lowercase" | "digits" | "hex" = "full"): string {
        let result: string = '';
        let characters: string = "";
        
        if (mode === "full") characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        if (mode === "lowercase") characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        if (mode === "digits") characters = "0123456789"; 
        if (mode === "hex") characters = "0123456789abcdef";        
        
        var charactersLength = characters.length;
        
        for (let i: number = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return result;
    }

    protected twoDigits(n: number): string {
        return (n < 10) ? `0${n}` : `${n}`;
    }  

    protected mysqlDate(date: Date): string {
        return `${date.getFullYear()}-${this.twoDigits(date.getMonth()+1)}-${this.twoDigits(date.getDate())}`;        
    } 
}