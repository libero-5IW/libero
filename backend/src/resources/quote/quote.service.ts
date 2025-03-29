import { Injectable } from '@nestjs/common';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { generateNextNumber } from 'src/common/utils/generate-number.util';

@Injectable()
export class QuoteService {
  async create(createQuoteDto: CreateQuoteDto) {
    //const number = await generateNextNumber('quote', userId);
    return 'This action adds a new quote';
  }

  findAll() {
    return `This action returns all quote`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quote`;
  }

  update(id: number, updateQuoteDto: UpdateQuoteDto) {
    return `This action updates a #${id} quote`;
  }

  remove(id: number) {
    return `This action removes a #${id} quote`;
  }
}
