import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Đăng nhập người dùng bằng email và mật khẩu
   */
  async login(email: string, pass: string) {
    if (!email || !pass) {
      throw new BadRequestException('Email và mật khẩu không được để trống.');
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      this.logger.warn(
        `Đăng nhập thất bại cho email ${email}: ${error.message}`,
      );
      throw new UnauthorizedException(
        error.message || 'Thông tin đăng nhập không chính xác.',
      );
    }

    return {
      user: data.user,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
        token_type: data.session?.token_type,
      },
    };
  }

  /**
   * Lấy thông tin người dùng hiện tại từ token xác thực
   */
  async getMe(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token xác thực không hợp lệ.');
    }

    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException(
        error?.message || 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.',
      );
    }

    return {
      user: data.user,
    };
  }

  /**
   * Đăng xuất người dùng
   */
  logout() {
    return {
      message: 'Đăng xuất thành công.',
    };
  }
}
