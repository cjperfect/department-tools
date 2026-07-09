import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentRequest } from './dto/create-department.dto';
import { UpdateDepartmentRequest } from './dto/update-department.dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards/auth.guards';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list() {
    return this.departmentsService.list();
  }

  @Post()
  async create(@Body() body: CreateDepartmentRequest) {
    return this.departmentsService.create(body.name);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDepartmentRequest,
  ) {
    return this.departmentsService.update(id, body.name);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.delete(id);
  }
}
