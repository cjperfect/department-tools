import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BiddingService } from './bidding.service';
import { AnalyzeRequest } from './dto/analyze.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/bidding')
@UseGuards(JwtAuthGuard)
export class BiddingController {
  constructor(private readonly biddingService: BiddingService) {}

  @Post('analyze')
  async analyze(
    @CurrentUser() user: any,
    @Body() body: AnalyzeRequest,
  ) {
    return this.biddingService.analyze(body.url, user.id);
  }

  @Get('records')
  async getRecords(
    @CurrentUser() user: any,
    @Query('q') q?: string,
  ) {
    return this.biddingService.getRecords(user.id, q);
  }

  @Delete('records/:recordId')
  async deleteRecord(
    @CurrentUser() user: any,
    @Param('recordId', ParseIntPipe) recordId: number,
  ) {
    return this.biddingService.deleteRecord(user.id, recordId);
  }
}
