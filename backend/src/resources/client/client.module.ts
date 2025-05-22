import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClientController],
  providers: [ClientService, UserService],
  exports: [ClientService],
})
export class ClientModule {}
