import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto, CreateMenuGroupDto } from './dto/menu.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/menus')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // --------------- 菜单项 ---------------

  @Get()
  async list(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.menusService.list({
      page: parseInt(page || '1'),
      pageSize: parseInt(pageSize || '10'),
      keyword,
    });
  }

  @Post()
  async create(@Body() body: CreateMenuDto) { return this.menusService.create(body); }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMenuDto) {
    return this.menusService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) { return this.menusService.delete(id); }

  // --------------- 分组 ---------------

  @Get('groups')
  async listGroups() { return this.menusService.listGroups(); }

  @Post('groups')
  async createGroup(@Body() body: CreateMenuGroupDto) { return this.menusService.createGroup(body); }

  @Put('groups/:id')
  async updateGroup(@Param('id', ParseIntPipe) id: number, @Body() body: CreateMenuGroupDto) {
    return this.menusService.updateGroup(id, body);
  }

  @Delete('groups/:id')
  async deleteGroup(@Param('id', ParseIntPipe) id: number) { return this.menusService.deleteGroup(id); }
}
