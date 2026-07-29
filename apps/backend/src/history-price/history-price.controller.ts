import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { HistoryPriceService } from './history-price.service'
import { JwtAuthGuard } from '../common/guards/auth.guards'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@Controller('api/history-price')
@UseGuards(JwtAuthGuard)
export class HistoryPriceController {
  constructor(private readonly historyPriceService: HistoryPriceService) {}

  /** 查询历史价格并保存 */
  @Get('query')
  async query(
    @Query('productUrl') productUrl: string,
    @CurrentUser() user: any
  ) {
    if (!productUrl) {
      throw new HttpException('缺少 productUrl 参数', HttpStatus.BAD_REQUEST)
    }

    try {
      return await this.historyPriceService.query({ productUrl }, user.id)
    } catch (e) {
      throw new HttpException(
        `查询历史价格失败: ${e instanceof Error ? e.message : '未知错误'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /** 获取已保存的历史价格列表 */
  @Get('list')
  async list(@CurrentUser() user: any) {
    return this.historyPriceService.list(user.id)
  }

  /** 刷新单个历史价格记录 */
  @Post('refresh/:id')
  async refresh(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any
  ) {
    try {
      return await this.historyPriceService.refresh(id, user.id)
    } catch (e) {
      throw new HttpException(
        `刷新失败: ${e instanceof Error ? e.message : '未知错误'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  /** 删除历史价格记录 */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any
  ) {
    await this.historyPriceService.remove(id, user.id)
    return { message: '已删除' }
  }
}
