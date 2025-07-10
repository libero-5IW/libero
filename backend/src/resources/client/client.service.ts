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
import { UserService } from '../user/user.service';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as stringify from 'csv-stringify/sync';
import slugify from 'slugify';

@Injectable()
export class ClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    createClientDto: CreateClientDto,
  ): Promise<ClientEntity> {
    await this.userService.getUserOrThrow(userId);

    const existingClient = await this.prisma.client.findUnique({
      where: {
        userId_email: {
          userId,
          email: createClientDto.email,
        },
      },
    });

    if (existingClient) {
      throw new ConflictException('Cet email est déjà utilisé par un client.');
    }

    const client = await this.prisma.client.create({
      data: {
        ...createClientDto,
        userId,
      },
    });

    return plainToInstance(ClientEntity, client);
  }

  async findAll(userId: string): Promise<ClientEntity[]> {
    const clients = await this.prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return plainToInstance(ClientEntity, clients);
  }

  async findOne(id: string, userId: string): Promise<ClientEntity> {
    const client = await this.getClientOrThrow(id, userId);
    return plainToInstance(ClientEntity, client);
  }

  async update(
    id: string,
    userId: string,
    updateClientDto: UpdateClientDto,
  ): Promise<ClientEntity> {
    await this.getClientOrThrow(id, userId);

    if (updateClientDto.email) {
      const clientWithSameEmail = await this.prisma.client.findUnique({
        where: {
          userId_email: {
            userId,
            email: updateClientDto.email,
          },
        },
      });

      if (clientWithSameEmail && clientWithSameEmail.id !== id) {
        throw new ConflictException(
          'Cet e-mail est déjà utilisé pour ce client.',
        );
      }
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: {
        ...updateClientDto,
        userId,
      },
    });

    return plainToInstance(ClientEntity, updatedClient);
  }

  async remove(id: string, userId: string): Promise<ClientEntity> {
    await this.getClientOrThrow(id, userId);

    const deletedClient = await this.prisma.client.delete({
      where: { id },
    });

    return plainToInstance(ClientEntity, deletedClient);
  }

  async getClientOrThrow(id: string, userId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
    });
    if (!client) {
      throw new NotFoundException('Client introuvable.');
    }
    return client;
  }

  async search(userId: string, term: string): Promise<ClientEntity[]> {
    const raw = term.trim().toLowerCase();
  
    const clients = await this.prisma.client.findMany({
      where: {
        userId,
        OR: [
          { firstName: { contains: raw, mode: 'insensitive' } },
          { lastName: { contains: raw, mode: 'insensitive' } },
          { email: { contains: raw, mode: 'insensitive' } },
          { phoneNumber: { contains: raw, mode: 'insensitive' } },
          { city: { contains: raw, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  
    return plainToInstance(ClientEntity, clients);
  }  

  async exportToCSV(userId: string): Promise<{ filename: string; content: string }> {
    const clients = await this.prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  
    const rows = clients.map((client) => ({
      prenom: client.firstName,
      nom: client.lastName,
      email: client.email,
      telephone: client.phoneNumber,
      adresse: client.addressLine,
      codePostal: client.postalCode,
      ville: client.city,
      pays: client.country,
      dateCreation: format(client.createdAt, 'dd/MM/yyyy', { locale: fr }),
    }));
  
    const content = stringify.stringify(rows, {
      header: true,
      columns: {
        prenom: 'Prénom',
        nom: 'Nom',
        email: 'Email',
        telephone: 'Téléphone',
        adresse: 'Adresse',
        codePostal: 'Code postal',
        ville: 'Ville',
        pays: 'Pays',
        dateCreation: 'Date de création',
      },
    });
  
    const firstClient = clients[0];
    const slug = firstClient
      ? slugify(`${firstClient.firstName}_${firstClient.lastName}`, { lower: true })
      : 'inconnu';
  
    return {
      filename: `clients_export_${slug}_${format(new Date(), 'yyyy-MM-dd')}.csv`,
      content,
    };
  }
  
}
