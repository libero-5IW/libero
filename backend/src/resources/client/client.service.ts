import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { plainToInstance } from 'class-transformer';
import { ClientEntity } from './entities/client.entity';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto): Promise<ClientEntity> {
    const existingClient = await this.prisma.client.findUnique({
      where: {
        userId_email: {   // Vu que tu as @@unique([userId, email])
          userId: createClientDto.userId,
          email: createClientDto.email,
        },
      },
    });

    if (existingClient) {
      throw new ConflictException('Ce client existe déjà pour cet utilisateur.');
    }

    const client = await this.prisma.client.create({
      data: createClientDto,
    });

    return plainToInstance(ClientEntity, client);
  }

  async findAll(): Promise<ClientEntity[]> {
    const clients = await this.prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
    return plainToInstance(ClientEntity, clients);
  }

  async findOne(id: string): Promise<ClientEntity> {
    const client = await this.getClientOrThrow(id);
    return plainToInstance(ClientEntity, client);
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<ClientEntity> {
    await this.getClientOrThrow(id);

    if (updateClientDto.email) {
      const clientWithSameEmail = await this.prisma.client.findUnique({
        where: {
          userId_email: {
            userId: updateClientDto.userId,
            email: updateClientDto.email,
          },
        },
      });

      if (clientWithSameEmail && clientWithSameEmail.id !== id) {
        throw new ConflictException('Cet e-mail est déjà utilisé pour ce client.');
      }
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });

    return plainToInstance(ClientEntity, updatedClient);
  }

  async remove(id: string): Promise<ClientEntity> {
    await this.getClientOrThrow(id);

    const deletedClient = await this.prisma.client.delete({
      where: { id },
    });

    return plainToInstance(ClientEntity, deletedClient);
  }

  private async getClientOrThrow(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException('Client introuvable.');
    }
    return client;
  }
}
