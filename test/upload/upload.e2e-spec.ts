import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadModule } from 'src/restapi/upload/upload.module';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigModule } from 'src/config/app.config';
import { TestConfigModule } from 'src/config/test.config';

describe('Upload -/upload (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UploadModule],
    })
      .overrideModule(AppConfigModule)
      .useModule(TestConfigModule)
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  // clear uploads folder before each test
  beforeAll(async () => {
    fs.readdirSync('uploads').forEach((file) => {
      const filePath = path.join('uploads', file);
      fs.unlinkSync(filePath);
    });
  });

  it('/upload (POST) success jpg', async () => {
    const res = await request(app.getHttpServer())
      .post('/upload')
      .set('Content-Type', 'multipart/form-data')
      .attach('image', 'test/upload/testImages/test1.jpg');

    expect(res.body).toHaveProperty('url');
    expect(res.status).toBe(201);
    expect(res.body.url).toContain('http://localhost:10002/images/');
  });

  it('/upload (POST) success png', async () => {
    const res = await request(app.getHttpServer())
      .post('/upload')
      .set('Content-Type', 'multipart/form-data')
      .attach('image', 'test/upload/testImages/test2.png');

    expect(res.body).toHaveProperty('url');
    expect(res.status).toBe(201);
    expect(res.body.url).toContain('http://localhost:10002/images/');
  });

  it('/upload (POST) success jpeg', async () => {
    const res = await request(app.getHttpServer())
      .post('/upload')
      .set('Content-Type', 'multipart/form-data')
      .attach('image', 'test/upload/testImages/test3.jpg');

    expect(res.body).toHaveProperty('url');
    expect(res.status).toBe(201);
    expect(res.body.url).toContain('http://localhost:10002/images/');
  });

  it('/upload (POST) fail file extension', async () => {
    const res = await request(app.getHttpServer())
      .post('/upload')
      .set('Content-Type', 'multipart/form-data')
      .attach('image', 'test/upload/invalidfile/test.cpp');

    console.log(res.body);
    expect(res.status).toBe(400);
  });

  it.todo('/upload (POST) fail file different magic number');
});
