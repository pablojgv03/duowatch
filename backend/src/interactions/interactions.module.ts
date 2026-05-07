import { Module, forwardRef } from '@nestjs/common';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [forwardRef(() => MatchesModule)],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}
