import { IKeyValue } from './model/keyvalue.interface';

export interface IConfig {
  readonly mainsiteUrl: string;
  readonly adminUrl: string;
  readonly backUrl: string;
  readonly corsedUrls: string[];
  readonly dbHost: string;
  readonly dbPort: number;
  readonly dbName: string;
  readonly dbLogin: string;
  readonly dbPassword: string;
  readonly appPort: number;
  readonly wsPort: number;
  readonly jwtAdmin: IJwtConfig;
  readonly jwtUser: IJwtConfig;
  readonly encryption: IEncryptionConfig;
  // при старте можно отправить настройки вебхука в телеграм, но вебхук должен быть один, поэтому надо следить, чтобы разные копии не перезаписывали его
  // тоже самое касается аутентификации MTProto API
  readonly tgInitOnStart: boolean;
  readonly onepayApiKey: string;
  readonly onepayIpnSecret: string;
}

export interface IJwtConfig {
  readonly secret: string;
  readonly signOptions: IJwtSignOptions;
}

export interface IJwtSignOptions {
  readonly expiresIn: number;
}

export interface IEncryptionConfig {
  readonly key: string;
  readonly iv: string;
}

// const env = process.env.env;
const env = 'dev';
const configs: IKeyValue<IConfig> = {
  dev: {
    mainsiteUrl: 'http://localhost:4200',
    adminUrl: 'http://localhost:4200',
    backUrl: 'http://localhost:3030',
    corsedUrls: [
      'https://admin.bithab.vio.net.ua',
      'https://app.bithab.vio.net.ua',
      'https://bithab.vio.net.ua',
      'http://localhost:4200',
      'http://localhost:4201',
      'http://localhost:4205',
      'http://localhost:64194',
    ],
    //dbHost: "localhost",
    // dbHost: '185.151.245.92',
    dbHost: '89.104.67.169',
    dbPort: 3306,
    //dbName: "bithab",
    dbName: 'mario',
    // dbLogin: 'vio',
    dbLogin: 'test',
    //dbPassword: "jid99deq", //
    // dbPassword: 'Vaiory36fix',
    dbPassword: 'qwerty123',
    appPort: 3030,
    wsPort: 3031,
    jwtAdmin: {
      secret: 'koshechki',
      signOptions: { expiresIn: 60 * 60 * 24 * 365 },
    },
    jwtUser: {
      secret: 'sobachki',
      signOptions: { expiresIn: 60 * 60 * 24 * 365 },
    },
    encryption: {
      key: '6562437b50e2336726de7e6df6b75a4fac21d66ab7694ef6c0fb245f39afdf6a',
      iv: '657f98160670dc6a11207c1c9b3c8c55',
    },
    // при старте можно отправить настройки вебхука в телеграм, но вебхук должен быть один, поэтому надо следить, чтобы разные копии не перезаписывали его
    // тоже самое касается аутентификации MTProto API
    tgInitOnStart: false,
    onepayApiKey: 'WRWTMCZ-820MJ9A-J5Q9XAQ-Y94JXPJ',
    onepayIpnSecret: 'SdBUXt+GXUB9pj+BR20xXvBJgPFPghWM',
  },
  prod2: {
    mainsiteUrl: 'https://app.drop.guide',
    adminUrl: 'https://admin.drop.guide',
    backUrl: 'https://back.drop.guide',
    corsedUrls: [
      'https://admin.drop.guide',
      'https://app.drop.guide',
      'https://drop.guide',
    ],
    dbHost: '127.0.0.1',
    dbPort: 3306,
    dbName: 'mario',
    dbLogin: 'root',
    dbPassword: 'Cilap90han',
    appPort: 4030,
    wsPort: 4031,
    jwtAdmin: {
      secret: 'koshechki',
      signOptions: { expiresIn: 60 * 60 * 24 * 365 },
    },
    jwtUser: {
      secret: 'sobachki',
      signOptions: { expiresIn: 60 * 60 * 24 * 365 },
    },
    encryption: {
      key: '6562437b50e2336726de7e6df6b75a4fac21d66ab7694ef6c0fb245f39afdf6a',
      iv: '657f98160670dc6a11207c1c9b3c8c55',
    },
    // при старте можно отправить настройки вебхука в телеграм, но вебхук должен быть один, поэтому надо следить, чтобы разные копии не перезаписывали его
    // тоже самое касается аутентификации MTProto API
    tgInitOnStart: true,
    onepayApiKey: 'Z8TRY68-80D4K18-QAEDEQ1-XAFP4KB',
    onepayIpnSecret: 'E1+BG3rnZmnlQN5ffMSyjguEKqax7fh5',
  },
};

export const cfg = configs[env];
