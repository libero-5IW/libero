import { Test, TestingModule } from '@nestjs/testing';
import { QuoteController } from '../../src/resources/quote/quote.controller';
import { QuoteService } from '../../src/resources/quote/quote.service';

describe('QuoteController', () => {
  let controller: QuoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuoteController],
      providers: [QuoteService],
    }).compile();

    controller = module.get<QuoteController>(QuoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
