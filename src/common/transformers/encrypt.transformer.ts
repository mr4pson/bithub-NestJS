import { createCipheriv, createDecipheriv, scrypt } from "crypto";
import { ValueTransformer } from "typeorm";

interface IEncryptOptions {
    readonly iv: string;
    readonly key: string;
}

export class EncryptTransformer implements ValueTransformer {
    constructor(private options: IEncryptOptions) {}
  
    public from(value: string): string {
        if (!value) return;  
        return this.decrypt(value);
    }
  
    public to(value: string): string {
        if (!value) return;
        return this.encrypt(value);      
    }

    ////////////////
    // utils
    ////////////////

    private encrypt(value: string): string {
        const iv = Buffer.from(this.options.iv, "hex");
        const key = Buffer.from(this.options.key, "hex");
        const cipher = createCipheriv('aes-256-ctr', key, iv);
        return Buffer.concat([cipher.update(value), cipher.final()]).toString("base64");
    } 
    
    private decrypt(value: string): string {
        const iv = Buffer.from(this.options.iv, "hex");
        const key = Buffer.from(this.options.key, "hex");
        const decipher = createDecipheriv('aes-256-ctr', key, iv);
        const buffer = Buffer.from(value, "base64"); 
        return Buffer.concat([decipher.update(buffer), decipher.final()]).toString();
    }
}