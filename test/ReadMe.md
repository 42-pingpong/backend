# E2E test 설명

- E2E테스트는 종단간 테스트로써, 브라우저와 서버 간에 인터렉션을 테스트합니다.
- 원할한 테스트를 위해 컨테이너가 아닌, `호스트컴퓨터`에서 테스트를 돌릴 수 있게했습니다.
- .env.test 를 example에 따라 구성한 이후, 호스트 컴퓨터에서 npm run test:e2e를 통해 종단간 테스트를 수행할 수 있습니다.

<br>

## 코드레벨 설명

```ts
describe('User -/user (e2e)', () => {
  let app: INestApplication;
  let datasource: DataSource;
  let repository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [testDatabase, UserModule],
    }).compile();

    datasource = moduleFixture.get<DataSource>(DataSource);
    // controller = moduleFixture.get<UserController>(UserController);
    // service = moduleFixture.get<UserService>(UserService);
    repository = datasource.getRepository(User);
    app = moduleFixture.createNestApplication();
    await moduleFixture.init();


    await app.listen(parseInt(process.env.NEST_PORT) - 2);
  });
```

- user모듈의 e2e 테스트 예시입니다.
- 종속성을 testDatabase를 가지며, testDatabase는 Config 모듈이 .env.test를 동적으로 가져오게되어있습니다.

## testDatabase

```
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import database from 'src/config/database';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
		  ignoreEnvVars: true, //환경변수 무시
          envFilePath: '.env.test', //환경변수가 아닌 호스트컴퓨터에서 설정한 특정 파일만 가져오게끔 설정.
          load: [database], //database.config가져오게끔 설정.
        }),
      ],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        //test suite는 docker network가 아닌, localhost로 접근해야합니다.
        //도커 컨테이너 내부에서 테스트 실행시 너무 느려서 사용하지 않습니다.
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: configService.get<any[]>('database.entities'),
        synchronize: true, //for development
        dropSchema: true, //for development
      }),
    }),
  ],
})
export class testDatabase {}
```

여기서 중요하게 봐야하는 건,  
1. load: [database]에서 ConfigService가 가지는 값들을 'database'라는 namespace안에 정리해서 가지고있게됩니다.
2. useFactory에서 위에서 정의된 configService를 통해 database connection 변수를 설정합니다. 

<br>

## .env.test sample

```
# Database env
POSTGRES_PORT=5432
POSTGRES_DBHOST=localhost
POSTGRES_PASSWORD=0000
POSTGRES_USER=pingpongdang
POSTGRES_DB=pingpong
NEST_PORT_E2E=10005
```


