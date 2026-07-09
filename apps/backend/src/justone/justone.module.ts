import { Global, Module } from '@nestjs/common';
import { JustOneService } from './justone.service';

@Global()
@Module({
  providers: [JustOneService],
  exports: [JustOneService],
})
export class JustOneModule {}
