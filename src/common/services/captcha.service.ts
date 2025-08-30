import { Injectable } from '@nestjs/common';
import { CNetworkService } from 'src/common/services/network.service';

export interface IRecaptchaResponse {
  readonly success: boolean;
  readonly action: string;
  readonly score: number;
  readonly challenge_ts: string;
  readonly hostname: string;
  readonly 'error-codes': string[];
}
@Injectable()
export class CCaptchaService {
  constructor(private networkService: CNetworkService) {}

  public async verify(token: string): Promise<boolean> {
    const key = '6LdlZ7crAAAAAEDk9I1f1I-mQiKFhlxN3ysrHtLX';
    const url = 'https://www.google.com/recaptcha/api/siteverify';

    if (!key) throw 'captcha setting not found';

    const fd = new URLSearchParams();

    fd.append('secret', key);
    fd.append('response', token);

    const res = await this.networkService.post(url, fd);
    const data = res.data as IRecaptchaResponse;

    // Проверяем успех, action и score
    console.log(data);
    return data.success && data.score > 0.5;
  }
}
