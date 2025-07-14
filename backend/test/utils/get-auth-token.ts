import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function getAuthToken(app: INestApplication) {
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'sarah@libero.com', password: 'azerty123' });
  
    return loginRes.body.token;
  }
  
