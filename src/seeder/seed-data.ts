import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import * as dotenv from 'dotenv';

console.log(
  'drop scheme가 기본적으로 활성화되어있습니다. 기존 데이터베이스가 모두 날라가니 주의하세요',
);
console.log('5초뒤 수행됩니다.');
const runner = async () => {
  dotenv.config({
    path: '.env.test',
  });

  const options: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    database: process.env.POSTGRES_DBHOST,
    username: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_DBHOST,
    password: process.env.POSTGRES_PASSWORD,

    dropSchema: true,
    synchronize: true,
  };
  const datasource = new DataSource(options);
  await datasource.initialize();

  runSeeders(datasource);
  console.log('end, SIGINT');
};

setTimeout(runner, 1000);
