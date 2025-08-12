import { Injectable } from "@nestjs/common";
import { spawn } from "child_process";
import { IDate } from "src/model/date.interface";
import { IChildable } from "src/model/childable.interface";
import { DataSource, Repository } from "typeorm";
import * as Mime from "mime-types";

@Injectable()
export class CAppService {
    constructor(protected dataSource: DataSource) {}

    ////////////////////////
    // strings
    ////////////////////////

    public isNumeric(str: string): boolean { // if string can be converted to number
        return !isNaN(parseFloat(str));
    }

    public twoDigits(n: number): string {
        return (n < 10) ? `0${n}` : `${n}`;
    }

    public stripTags(str: string): string {
        return str.replace(/<\/?[^>]+(>|$)/g, "");
    }

    public adjustYtContent(content: string): string {
        if (!content) return "";
        let newContent = content;

        for (let param of ["width", "height"]) {
            const pos1 = newContent.indexOf(`${param}=`);

            if (pos1 !== -1) {
                const pos2 = newContent.indexOf(" ", pos1);
                newContent = newContent.slice(0, pos1) + newContent.slice(pos2+1);
            }
        }

        return newContent;
    }

    ////////////////////////
    // dates
    ////////////////////////

    public humanDate(date: Date, withTime = false): string {
        if (!date) return "";
        return withTime ?
            `${this.twoDigits(date.getDate())}.${this.twoDigits(date.getMonth()+1)}.${date.getFullYear()} ${this.twoDigits(date.getHours())}:${this.twoDigits(date.getMinutes())}` :
            `${this.twoDigits(date.getDate())}.${this.twoDigits(date.getMonth()+1)}.${date.getFullYear()}`;
    }

    public mysqlDate(date: Date, format: "date" | "datetime-short" | "datetime" = "date"): string {
        if (!date) return "";

        switch (format) {
            case "date":
                return `${date.getFullYear()}-${this.twoDigits(date.getMonth()+1)}-${this.twoDigits(date.getDate())}`;
            case "datetime":
                return `${date.getFullYear()}-${this.twoDigits(date.getMonth()+1)}-${this.twoDigits(date.getDate())} ${this.twoDigits(date.getHours())}:${this.twoDigits(date.getMinutes())}:${this.twoDigits(date.getSeconds())}`;
            case "datetime-short":
                return `${date.getFullYear()}-${this.twoDigits(date.getMonth()+1)}-${this.twoDigits(date.getDate())} ${this.twoDigits(date.getHours())}:${this.twoDigits(date.getMinutes())}`;
        }
    }

    public isDateValid(date: any): boolean {
        return !isNaN(date) && date instanceof Date;
    }

    public splitMysqlDate(date: string): IDate {
        const parts = date.split('-').map(p => parseInt(p));
        return {
            year: parts[0],
            month: parts[1],
            day: parts[2],
        };
    }

    // 2020-01-02 -> 02.01.2020
    public mysqlDateToHumanDate(date: string): string {
        const sections = date.split("-");
        return `${sections[2]}.${sections[1]}.${sections[0]}`;
    }

    public age(birthdate: Date): number {
        var diff = Date.now() - birthdate.getTime();
        var ageDate = new Date(diff); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    public daysInMonth(month: number, year: number): number {
        return 32 - new Date(year, month, 32).getDate()
    }

    public utcToLocal(date: Date, tz: number): Date { // здесь tz - это time zone offset (разница с UTC в минутах, которая приходит с фронта как Date().getTimezoneOffset())
        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() - tz);
        return newDate;
    }

    public localToUtc(date: Date, tz: number): Date { // здесь tz - это time zone offset (разница с UTC в минутах, которая приходит с фронта как Date().getTimezoneOffset())
        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() + tz);
        return newDate;
    }

    ////////////////////////
    // processes
    ////////////////////////

    public spawn(cmd: string): Promise<number> {
        return new Promise((resolve, reject) => {
            const process = spawn(cmd, {shell: true});
            process.on("error", err => reject(err)); // start failed
            process.on("close", code => code ? reject(`spawn [${cmd}] failed with code ${code}`) : resolve(code));
            process.stdout.on('data', data => console.log(data.toString()));
            process.stderr.on('data', (data) => console.error(`stderr: ${data}`));
        });
    }

    ////////////////////////
    // randomizing
    ////////////////////////

    public random(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    public randomString(length: number, mode: "full" | "lowercase" | "digits" | "hex" = "full"): string {
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

    ////////////////////////
    // arrays
    ////////////////////////

    public arrayUnique(array: any[]): any[] {
        return [...new Set(array)];
    }

    /*
    public objArrayUniqe(array: IKeyValue<any>[], keyField: string): IKeyValue<any> {

    }
    */

    public arraySplit(array: any[], chunkLength: number): any[][] {
        const chunks = [];

        for (let i = 0; i < array.length; i += chunkLength) {
            const chunk = array.slice(i, i + chunkLength);
            chunks.push(chunk);
        }

        return chunks;
    }

    public range(a: number, b: number): number[] {
        const arr: number[] = [];

        for (let i = a; i <= b; i++) {
            arr.push(i);
        }

        return arr;
    }

    // разбиение массива с балансировкой - разбиваем на N максимально равных групп (если 25 делим на три группы, то получаем две группы по 8 и одну по 9)
    public balancedChunkify(arr: any[], n: number): any[] {
        if (n < 2) return [arr];

        const len = arr.length;
        const out = [];
        let i = 0;
        let size;

        if (len % n === 0) {
            size = Math.floor(len / n);

            while (i < len) {
                out.push(arr.slice(i, i += size));
            }
        } else {
            while (i < len) {
                size = Math.ceil((len - i) / n--);
                out.push(arr.slice(i, i += size));
            }
        }

        return out;
    }

    public arrayShuffle(array: any[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    ////////////////////////
    // models
    ////////////////////////

    // построение дерева потомков (сейчас обычно не используется)
    public async buildChildrenTree(entity: string, x: IChildable, sortBy: string, sortDir: number, onlyActive: boolean = false, relations: string[] = []): Promise<IChildable[]> {
        const repository: Repository<any> = this.dataSource.getRepository(entity);
        const where: any = {parent_id: x.id};
        onlyActive && (where.active = true);
        const children = await repository.find({where, order: {[sortBy]: sortDir}, relations});

        for (let child of children) {
            child.children = await this.buildChildrenTree(entity, child, sortBy, sortDir, onlyActive, relations);
        }

        return children;
    }

    // построение списка потомков
    public async buildChildrenList(entity: string, x: IChildable, sortBy: string, sortDir: number, onlyActive: boolean, relations: string[], level: number): Promise<IChildable[]> {
        const repository: Repository<any> = this.dataSource.getRepository(entity);
        const where: any = {parent_id: x.id};
        onlyActive && (where.active = true);
        const children = await repository.find({where, order: {[sortBy]: sortDir}, relations});
        let data: IChildable[] = [];

        for (let child of children) {
            child.__level = level;
            child.__shift = "";

            for (let i: number = 0; i < level; i++) {
                child.__shift += "&nbsp;&nbsp;&nbsp;";
            }

            data.push(child);
            data = [...data, ...await this.buildChildrenList(entity, child, sortBy, sortDir, onlyActive, relations, level+1)];
        }

        return data;
    }

    ////////////////////////
    // files
    ////////////////////////

    public getFileExtensionByName(filename: string): string {
        return /(?:\.([^.]+))?$/.exec(filename)[1] || "dat";
    }

    public getFileExtensionByData(data: string): string {
        const mimeString = this.getContentType(data);
        return Mime.extension(mimeString) || "txt";
    }

    public getContentType(data: string): string {
        return data.substring(data.indexOf(":")+1, data.indexOf(";"));
    }

    ////////////////////////
    // misc
    ////////////////////////

    public pause(ms: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), ms);
        });
    }
}
