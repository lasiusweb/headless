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
  HttpCode
} from '@nestjs/common';
import { CropService } from './crop.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Crops')
@Controller('crops')
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new crop' })
  @ApiResponse({ status: 201, description: 'Crop created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createCropDto: CreateCropDto) {
    return this.cropService.create(createCropDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all crops' })
  @ApiResponse({ status: 200, description: 'List of crops' })
  findAll() {
    return this.cropService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a crop by ID' })
  @ApiParam({ name: 'id', description: 'Crop ID' })
  @ApiResponse({ status: 200, description: 'Crop details' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  findOne(@Param('id') id: string) {
    return this.cropService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a crop' })
  @ApiParam({ name: 'id', description: 'Crop ID' })
  @ApiResponse({ status: 200, description: 'Crop updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  update(@Param('id') id: string, @Body() updateCropDto: UpdateCropDto) {
    return this.cropService.update(id, updateCropDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a crop' })
  @ApiParam({ name: 'id', description: 'Crop ID' })
  @ApiResponse({ status: 200, description: 'Crop deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Crop not found' })
  remove(@Param('id') id: string) {
    return this.cropService.remove(id);
  }
}