import { Test, TestingModule } from '@nestjs/testing';
import { TiktokAutomationService } from './tiktok-automation.service';

describe('TiktokAutomationService', () => {
  let service: TiktokAutomationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiktokAutomationService],
    }).compile();

    service = module.get<TiktokAutomationService>(TiktokAutomationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
