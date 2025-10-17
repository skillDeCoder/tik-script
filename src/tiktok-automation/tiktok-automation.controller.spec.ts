import { Test, TestingModule } from '@nestjs/testing';
import { TiktokAutomationController } from './tiktok-automation.controller';

describe('TiktokAutomationController', () => {
  let controller: TiktokAutomationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiktokAutomationController],
    }).compile();

    controller = module.get<TiktokAutomationController>(
      TiktokAutomationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
