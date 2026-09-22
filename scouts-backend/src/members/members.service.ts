import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Lấy danh sách thành viên (MEMBERS)
   * Hỗ trợ giới hạn số lượng (limit) và phân trang (offset)
   */
  async findAll(limit: number = 50, offset: number = 0) {
    const supabase = this.supabaseService.getClient();

    const { data, error, count } = await supabase
      .from('Members')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(
        `Lỗi khi lấy danh sách Members: ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        `Không thể lấy danh sách thành viên: ${error.message}`,
      );
    }

    return {
      total: count,
      limit,
      offset,
      data,
    };
  }

  /**
   * Lấy chi tiết một thành viên theo ID
   */
  async findOne(id: number) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('Members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Không tìm thấy thành viên có ID = ${id}`);
      }
      this.logger.error(
        `Lỗi khi lấy thông tin thành viên ID = ${id}: ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        `Lỗi khi truy vấn thành viên: ${error.message}`,
      );
    }

    return data;
  }
}
