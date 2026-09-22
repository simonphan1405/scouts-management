import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Ưu tiên SERVICE_ROLE_KEY cho backend nếu có, nếu không thì dùng ANON_KEY / SUPABASE_KEY
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn(
        '⚠️ Supabase URL hoặc Key chưa được cấu hình trong file .env! Vui lòng bổ sung SUPABASE_URL và SUPABASE_KEY.',
      );
      return;
    }

    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    this.logger.log('✅ Đã khởi tạo Supabase Client thành công!');
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error(
        'Supabase client chưa được khởi tạo. Hãy kiểm tra lại biến môi trường SUPABASE_URL và SUPABASE_KEY / SUPABASE_SERVICE_ROLE_KEY trong file .env.',
      );
    }
    return this.client;
  }
}
