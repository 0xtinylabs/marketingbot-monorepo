import { Test, TestingModule } from '@nestjs/testing';
import { LoopService } from './loop.service';

describe('LoopService', () => {
  let service: LoopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoopService],
    }).compile();

    service = module.get<LoopService>(LoopService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
