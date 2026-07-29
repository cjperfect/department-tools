import { Global, Module } from '@nestjs/common'
import { HistoryPriceController } from './history-price.controller'
import { HistoryPriceService } from './history-price.service'
import { PrismaModule } from '../prisma/prisma.module'

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [HistoryPriceController],
  providers: [HistoryPriceService],
  exports: [HistoryPriceService],
})
export class HistoryPriceModule {}
