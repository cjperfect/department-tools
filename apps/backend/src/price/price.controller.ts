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
import { PriceService } from './price.service';
import { AddMonitorRequest } from './dto/add-monitor.dto';
import { JwtAuthGuard } from '../common/guards/auth.guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('api/price')
@UseGuards(JwtAuthGuard)
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get('monitor')
  async getList(@CurrentUser() user: any) {
    return this.priceService.getList(user.id);
  }

  @Post('monitor')
  async addMonitor(
    @CurrentUser() user: any,
    @Body() body: AddMonitorRequest,
  ) {
    const items = body.items.map((i) => ({
      platform: i.platform,
      targetPrice: i.targetPrice,
    }));
    return this.priceService.addMonitor(user.id, body.keyword || '', items);
  }

  @Delete('monitor/product/:productId')
  async deleteProduct(
    @CurrentUser() user: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.priceService.deleteProduct(user.id, productId);
  }

  @Delete('monitor/item/:itemId')
  async deleteItem(
    @CurrentUser() user: any,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.priceService.deleteItem(user.id, itemId);
  }

  @Get('stats')
  async getStats() {
    return this.priceService.getStats();
  }

  @Get('compare/:itemId')
  async getCompare(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.priceService.getCompare(itemId);
  }

  @Post('monitor/refresh/:itemId')
  async refreshItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.priceService.refreshItem(itemId);
  }

  @Get('search/:productId')
  async searchCompare(
    @CurrentUser() user: any,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.priceService.searchCompare(user.id, productId);
  }

  @Get('history/:itemId')
  async getHistory(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.priceService.getHistory(itemId);
  }
}
