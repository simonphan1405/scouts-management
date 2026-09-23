import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  /**
   * Danh sách tất cả các bảng CMS
   */
  @Get()
  getTables() {
    return this.tablesService.getTables();
  }

  /**
   * Lấy cấu trúc metadata cột của một bảng
   */
  @Get(':tableName/schema')
  getTableSchema(@Param('tableName') tableName: string) {
    return this.tablesService.getTableSchema(tableName);
  }

  /**
   * Lấy danh sách options liên kết phục vụ quan hệ khóa ngoại
   */
  @Get(':tableName/relations')
  getRelationOptions(@Param('tableName') tableName: string) {
    return this.tablesService.getRelationOptions(tableName);
  }

  /**
   * Lấy danh sách bản ghi trong bảng
   */
  @Get(':tableName')
  getRecords(
    @Param('tableName') tableName: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 1000;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return this.tablesService.getRecords(tableName, parsedLimit, parsedOffset);
  }

  /**
   * Lấy chi tiết một bản ghi theo ID
   */
  @Get(':tableName/:id')
  getRecordById(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
  ) {
    return this.tablesService.getRecordById(tableName, id);
  }

  /**
   * Tạo mới bản ghi trong bảng
   */
  @Post(':tableName')
  createRecord(
    @Param('tableName') tableName: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.tablesService.createRecord(tableName, payload);
  }

  /**
   * Cập nhật bản ghi theo ID
   */
  @Put(':tableName/:id')
  updateRecord(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.tablesService.updateRecord(tableName, id, payload);
  }

  /**
   * Xóa bản ghi theo ID
   */
  @Delete(':tableName/:id')
  deleteRecord(@Param('tableName') tableName: string, @Param('id') id: string) {
    return this.tablesService.deleteRecord(tableName, id);
  }
}
