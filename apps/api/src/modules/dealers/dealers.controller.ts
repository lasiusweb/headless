import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DealersService } from './dealers.service';
import { CreateDealerDto } from './dto/create-dealer.dto';
import { UpdateDealerDto } from './dto/update-dealer.dto';
import { DealerApplication } from './interfaces/dealer-application.interface';

@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Post()
  create(@Body() createDealerDto: CreateDealerDto) {
    return this.dealersService.create(createDealerDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    if (status) {
      return this.dealersService.findByStatus(status);
    }
    return this.dealersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDealerDto: UpdateDealerDto) {
    return this.dealersService.update(id, updateDealerDto);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body('adminId') adminId: string) {
    return this.dealersService.approve(id, adminId);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string, 
    @Body('adminId') adminId: string, 
    @Body('reason') reason?: string
  ) {
    return this.dealersService.reject(id, adminId, reason);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dealersService.remove(id);
  }
}