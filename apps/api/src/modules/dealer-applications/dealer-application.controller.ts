import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  HttpStatus,
  HttpCode,
  Req
} from '@nestjs/common';
import { DealerApplicationService } from './dealer-application.service';
import { CreateDealerApplicationDto } from './dto/create-dealer-application.dto';
import { UpdateDealerApplicationDto } from './dto/update-dealer-application.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Dealer Applications')
@Controller('dealer-applications')
export class DealerApplicationController {
  constructor(private readonly dealerApplicationService: DealerApplicationService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all dealer applications (admin only)' })
  @ApiResponse({ status: 200, description: 'List of dealer applications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll() {
    return this.dealerApplicationService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my-application')
  @ApiOperation({ summary: 'Get current user\'s dealer application' })
  @ApiResponse({ status: 200, description: 'Dealer application details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUser(@Req() req) {
    return this.dealerApplicationService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a dealer application by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Dealer application details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Dealer application not found' })
  async findOne(@Param('id') id: string) {
    return this.dealerApplicationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Submit a new dealer application' })
  @ApiResponse({ status: 201, description: 'Dealer application submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Already have pending application' })
  async create(@Body() createDealerApplicationDto: CreateDealerApplicationDto, @Req() req) {
    return this.dealerApplicationService.create(createDealerApplicationDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a dealer application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Dealer application updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Dealer application not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateDealerApplicationDto: UpdateDealerApplicationDto, 
    @Req() req
  ) {
    return this.dealerApplicationService.update(id, updateDealerApplicationDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update dealer application status (admin only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Dealer application status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Dealer application not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req,
    @Body('rejectionReason') rejectionReason?: string
  ) {
    return this.dealerApplicationService.updateStatus(id, status, req.user.id, rejectionReason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a dealer application (admin only)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Dealer application deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string) {
    return this.dealerApplicationService.remove(id);
  }
}