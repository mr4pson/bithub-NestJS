import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { AxiosRequestConfig, AxiosResponse } from "axios";

@Injectable()
export class CNetworkService {
    constructor(private httpService: HttpService) {}

    public get(url: string, options: AxiosRequestConfig = null): Promise<AxiosResponse<any,any>> {
        return new Promise((resolve, reject) => {
            this.httpService.get(url, options).subscribe({
                next: res => resolve(res),
                error: err => reject(err.code),
            });
        });
    }

    public forcedGet(url: string, options: AxiosRequestConfig = null): Promise<AxiosResponse<any,any>> {
        return new Promise(async (resolve, reject) => {
            let retries = 0;
            const get = () => {
                this.httpService.get(url, options).subscribe({
                    next: res => resolve(res),
                    error: err => retries++ < 10 ? setTimeout(() => get(), 100) : reject(err.code),
                });
            };
            get();
        });        
    }

    public post(url: string, data: any = null, options: AxiosRequestConfig = null): Promise<AxiosResponse<any,any>> {
        return new Promise((resolve, reject) => {
            this.httpService.post(url, data, options).subscribe({
                next: res => resolve(res),
                error: err => reject(err.code),
            });
        });
    }

    public forcedPost(url: string, data: any, options: AxiosRequestConfig = null): Promise<AxiosResponse<any,any>> {
        return new Promise(async (resolve, reject) => {
            let retries = 0;
            const post = () => {
                this.httpService.post(url, data, options).subscribe({
                    next: res => resolve(res),
                    error: err => retries++ < 10 ? setTimeout(() => post(), 100) : reject(err.code),
                });
            };
            post();
        });        
    }
}