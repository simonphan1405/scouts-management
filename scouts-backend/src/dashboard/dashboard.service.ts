import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface SectionLiveStats {
  memberCount: number;
  troopCount: number;
  rankingCount: number;
  rankings: string[];
  percentage: number;
}

export interface DashboardOverviewResponse {
  memberCount: number;
  sectionCount: number;
  unitCounts: {
    councils: number;
    districts: number;
    groups: number;
    troops: number;
    units: number;
  };
  expenseTotal: number;
  sectionStats: Record<string, SectionLiveStats>;
  tableCounts: Record<string, number>;
}

const SECTION_NAME_MAP: Record<string, string> = {
  nhi: 'Nhi',
  au: 'Ấu',
  thieu: 'Thiếu',
  kha: 'Kha',
  trang: 'Tráng',
};

interface MemberRow {
  id: string | number;
  full_name?: string | null;
  current_section?: string | null;
  role?: string | null;
}

interface TroopRow {
  id: string | number;
  name?: string | null;
  section?: string | null;
}

interface RankingRow {
  id: string | number;
  name?: string | null;
  level?: number | string | null;
  section?: string | null;
}

interface ExpenseRow {
  id: string | number;
  amount?: number | string | null;
  purpose?: string | null;
}

interface NamedRow {
  id: string | number;
  name?: string | null;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Tổng hợp toàn bộ số liệu thống kê nghiệp vụ cho Dashboard
   */
  async getOverview(): Promise<DashboardOverviewResponse> {
    const supabase = this.supabaseService.getClient();

    try {
      // Truy vấn song song dữ liệu các bảng từ Supabase
      const [
        membersRes,
        sectionsRes,
        councilsRes,
        districtsRes,
        groupsRes,
        troopsRes,
        unitsRes,
        rankingsRes,
        expensesRes,
        religionsRes,
      ] = await Promise.all([
        supabase.from('Members').select('id, full_name, current_section, role'),
        supabase.from('Sections').select('id, name'),
        supabase.from('Councils').select('id, name'),
        supabase.from('Districts').select('id, name'),
        supabase.from('Groups').select('id, name'),
        supabase.from('Troops').select('id, name, section'),
        supabase.from('Units').select('id, name'),
        supabase.from('Rankings').select('id, name, level, section'),
        supabase.from('Expenses').select('id, amount, purpose'),
        supabase.from('Religions').select('id, name'),
      ]);

      // Trích xuất mảng dữ liệu an toàn
      const memberList = (membersRes.data ?? []) as MemberRow[];
      const sectionList = (sectionsRes.data ?? []) as NamedRow[];
      const councilList = (councilsRes.data ?? []) as NamedRow[];
      const districtList = (districtsRes.data ?? []) as NamedRow[];
      const groupList = (groupsRes.data ?? []) as NamedRow[];
      const troopList = (troopsRes.data ?? []) as TroopRow[];
      const unitList = (unitsRes.data ?? []) as NamedRow[];
      const rankingList = (rankingsRes.data ?? []) as RankingRow[];
      const expenseList = (expensesRes.data ?? []) as ExpenseRow[];
      const religionList = (religionsRes.data ?? []) as NamedRow[];

      const memberCount = memberList.length;
      const sectionCount = sectionList.length;

      const unitCounts = {
        councils: councilList.length,
        districts: districtList.length,
        groups: groupList.length,
        troops: troopList.length,
        units: unitList.length,
      };

      // Tính tổng kinh phí
      const expenseTotal = expenseList.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0,
      );

      // Tính thống kê nghiệp vụ theo 5 ngành sinh hoạt Hướng Đạo
      const sectionStats: Record<string, SectionLiveStats> = {};

      for (const [key, sectionName] of Object.entries(SECTION_NAME_MAP)) {
        const nameLower = sectionName.toLowerCase();

        // Lọc đoàn sinh theo ngành
        const membersInSection = memberList.filter(
          (m) => m.current_section?.toLowerCase() === nameLower,
        );

        // Lọc các đoàn theo ngành
        const troopsInSection = troopList.filter(
          (t) => t.section?.toLowerCase() === nameLower,
        );

        // Lấy danh sách đẳng thứ theo ngành và sắp xếp theo cấp bậc
        const rankingsInSection: string[] = rankingList
          .filter((r) => r.section?.toLowerCase() === nameLower)
          .sort((a, b) => (Number(a.level) || 0) - (Number(b.level) || 0))
          .map((r) => r.name || '')
          .filter((name): name is string => Boolean(name));

        const memberNum = membersInSection.length;
        const percentage =
          memberCount > 0 ? Math.round((memberNum / memberCount) * 100) : 0;

        sectionStats[key] = {
          memberCount: memberNum,
          troopCount: troopsInSection.length,
          rankingCount: rankingsInSection.length,
          rankings: rankingsInSection,
          percentage,
        };
      }

      // Đếm số lượng bản ghi các bảng CMS
      const tableCounts: Record<string, number> = {
        members: memberCount,
        sections: sectionCount,
        councils: councilList.length,
        districts: districtList.length,
        groups: groupList.length,
        troops: troopList.length,
        units: unitList.length,
        rankings: rankingList.length,
        expenses: expenseList.length,
        religions: religionList.length,
      };

      return {
        memberCount,
        sectionCount,
        unitCounts,
        expenseTotal,
        sectionStats,
        tableCounts,
      };
    } catch (error: unknown) {
      const err = error as Error;
      const errorMsg = err?.message || String(error);
      this.logger.error(
        `Lỗi tổng hợp số liệu Dashboard: ${errorMsg}`,
        err?.stack,
      );
      throw new InternalServerErrorException(
        `Không thể tổng hợp số liệu thống kê: ${errorMsg}`,
      );
    }
  }
}
