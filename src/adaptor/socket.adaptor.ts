import { IoAdapter } from '@nestjs/platform-socket.io';
import * as session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

export class SessionIoAdaptor extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    const redisClient = createClient({
      url: 'redis://redis:6379',
      database: 0,
    });

    server.use(
      session({
        store: new RedisStore({
          client: redisClient,
        }),
        resave: false,
        saveUninitialized: true,
        secret: 't',
        cookie: {
          httpOnly: true,
          secure: false,
        },
      }),
    );
    return server;
  }
}
