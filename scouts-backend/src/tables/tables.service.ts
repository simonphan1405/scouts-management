import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  relationTo?: string;
  isMulti?: boolean;
}

export interface TableMeta {
  name: string;
  collectionField: string;
  typeName: string;
}

export interface RelationOption {
  id: string;
  name: string;
  value: string;
  label: string;
}

// Định nghĩa Metadata cấu trúc các bảng CMS theo chuẩn Supabase Database
const TABLE_METADATA: Record<
  string,
  { typeName: string; columns: ColumnMeta[] }
> = {
  councils: {
    typeName: 'Councils',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'address', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
      { name: 'founded_date', type: 'Date', nullable: true },
    ],
  },
  districts: {
    typeName: 'Districts',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'address', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
      { name: 'founded_date', type: 'Date', nullable: true },
      {
        name: 'council',
        type: 'String',
        nullable: true,
        relationTo: 'councilsCollection',
      },
    ],
  },
  groups: {
    typeName: 'Groups',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'address', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
      { name: 'founded_date', type: 'Date', nullable: true },
      {
        name: 'district',
        type: 'String',
        nullable: true,
        relationTo: 'districtsCollection',
      },
    ],
  },
  troops: {
    typeName: 'Troops',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'address', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
      { name: 'founded_date', type: 'Date', nullable: true },
      {
        name: 'group',
        type: 'String',
        nullable: true,
        relationTo: 'groupsCollection',
      },
      {
        name: 'section',
        type: 'String',
        nullable: true,
        relationTo: 'sectionsCollection',
      },
    ],
  },
  units: {
    typeName: 'Units',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
      { name: 'unit_type', type: 'String', nullable: true },
      {
        name: 'troop',
        type: 'BigInt',
        nullable: true,
        relationTo: 'troopsCollection',
      },
    ],
  },
  sections: {
    typeName: 'Sections',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
      { name: 'min_age', type: 'Int', nullable: true },
      { name: 'max_age', type: 'Int', nullable: true },
      { name: 'motto', type: 'String', nullable: true },
    ],
  },
  rankings: {
    typeName: 'Rankings',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'level', type: 'Int', nullable: true },
      { name: 'requirement', type: 'String', nullable: true },
      {
        name: 'section',
        type: 'String',
        nullable: true,
        relationTo: 'sectionsCollection',
      },
      { name: 'description', type: 'String', nullable: true },
    ],
  },
  members: {
    typeName: 'Members',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'full_name', type: 'String', nullable: true },
      { name: 'gender', type: 'String', nullable: true },
      { name: 'date_of_birth', type: 'Date', nullable: true },
      { name: 'identification_number', type: 'String', nullable: true },
      {
        name: 'religion',
        type: 'BigInt',
        nullable: true,
        relationTo: 'religionsCollection',
      },
      { name: 'join_year', type: 'Int', nullable: true },
      { name: 'promise_year', type: 'Int', nullable: true },
      {
        name: 'current_section',
        type: 'String',
        nullable: true,
        relationTo: 'sectionsCollection',
      },
      {
        name: 'previous_sections',
        type: 'String',
        nullable: true,
        relationTo: 'sectionsCollection',
        isMulti: true,
      },
      {
        name: 'council',
        type: 'String',
        nullable: true,
        relationTo: 'councilsCollection',
      },
      {
        name: 'district',
        type: 'String',
        nullable: true,
        relationTo: 'districtsCollection',
      },
      {
        name: 'group',
        type: 'String',
        nullable: true,
        relationTo: 'groupsCollection',
      },
      {
        name: 'troop',
        type: 'String',
        nullable: true,
        relationTo: 'troopsCollection',
      },
      {
        name: 'unit',
        type: 'BigInt',
        nullable: true,
        relationTo: 'unitsCollection',
      },
      {
        name: 'ranking',
        type: 'BigInt',
        nullable: true,
        relationTo: 'rankingsCollection',
      },
      { name: 'role', type: 'String', nullable: true },
    ],
  },
  expenses: {
    typeName: 'Expenses',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      {
        name: 'member_id',
        type: 'BigInt',
        nullable: true,
        relationTo: 'membersCollection',
      },
      { name: 'amount', type: 'Float', nullable: true },
      { name: 'purpose', type: 'String', nullable: true },
      { name: 'payment_date', type: 'Date', nullable: true },
      { name: 'notes', type: 'String', nullable: true },
      { name: 'status', type: 'String', nullable: true },
    ],
  },
  religions: {
    typeName: 'Religions',
    columns: [
      { name: 'id', type: 'BigInt', nullable: false },
      { name: 'name', type: 'String', nullable: true },
      { name: 'code', type: 'String', nullable: true },
      { name: 'description', type: 'String', nullable: true },
    ],
  },
};

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Chuẩn hóa tên bảng về dạng chữ thường không có Collection
   */
  normalizeTableName(rawName: string): string {
    return rawName.replace(/Collection$/i, '').toLowerCase();
  }

  /**
   * Lấy tên bảng thực tế trong cơ sở dữ liệu Supabase (PascalCase)
   */
  getDbTableName(rawName: string): string {
    const table = this.normalizeTableName(rawName);
    return TABLE_METADATA[table]?.typeName || rawName;
  }

  /**
   * Lấy danh sách tất cả các bảng CMS
   */
  getTables(): TableMeta[] {
    return Object.keys(TABLE_METADATA).map((table) => ({
      name: table,
      collectionField: `${table}Collection`,
      typeName: TABLE_METADATA[table].typeName,
    }));
  }

  /**
   * Lấy cấu trúc metadata của một bảng
   */
  getTableSchema(rawName: string): ColumnMeta[] {
    const table = this.normalizeTableName(rawName);
    const meta = TABLE_METADATA[table];
    if (!meta) {
      throw new NotFoundException(
        `Bảng "${rawName}" không tồn tại trong hệ thống CMS.`,
      );
    }
    return meta.columns;
  }

  /**
   * Lấy danh sách bản ghi của một bảng (kèm phân trang, lọc)
   */
  async getRecords(rawName: string, limit: number = 1000, offset: number = 0) {
    const table = this.normalizeTableName(rawName);
    const dbTable = this.getDbTableName(rawName);
    const supabase = this.supabaseService.getClient();

    const { data, error, count } = await supabase
      .from(dbTable)
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      this.logger.error(
        `Lỗi truy vấn bảng ${dbTable} (${table}): ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        `Không thể lấy dữ liệu bảng ${table}: ${error.message}`,
      );
    }

    if (table === 'members' && data && data.length > 0) {
      await this.enrichMembersWithHierarchy(data);
    }

    return {
      rows: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    };
  }

  /**
   * Truy vấn ngược từ Đoàn trực thuộc (troop) theo khóa quan hệ để điền đủ thông tin:
   * - Liên đoàn trực thuộc (group)
   * - Đạo trực thuộc (district)
   * - Châu trực thuộc (council)
   */
  async enrichMembersWithHierarchy(members: any[]): Promise<any[]> {
    if (!members || members.length === 0) return members;

    const supabase = this.supabaseService.getClient();

    try {
      const [troopsRes, groupsRes, districtsRes, unitsRes] = await Promise.all([
        supabase.from('Troops').select('id, name, group'),
        supabase.from('Groups').select('id, name, district'),
        supabase.from('Districts').select('id, name, council'),
        supabase.from('Units').select('id, name, troop'),
      ]);

      const troops = troopsRes.data || [];
      const groups = groupsRes.data || [];
      const districts = districtsRes.data || [];
      const units = unitsRes.data || [];

      // Map troops by id and normalized name
      const troopMap = new Map<string, any>();
      for (const t of troops) {
        troopMap.set(String(t.id), t);
        if (t.name) {
          troopMap.set(String(t.name).trim().toLowerCase(), t);
        }
      }

      // Map groups by id and normalized name
      const groupMap = new Map<string, any>();
      for (const g of groups) {
        groupMap.set(String(g.id), g);
        if (g.name) {
          groupMap.set(String(g.name).trim().toLowerCase(), g);
        }
      }

      // Map districts by id and normalized name
      const districtMap = new Map<string, any>();
      for (const d of districts) {
        districtMap.set(String(d.id), d);
        if (d.name) {
          districtMap.set(String(d.name).trim().toLowerCase(), d);
        }
      }

      // Map units by id and normalized name
      const unitMap = new Map<string, any>();
      for (const u of units) {
        unitMap.set(String(u.id), u);
        if (u.name) {
          unitMap.set(String(u.name).trim().toLowerCase(), u);
        }
      }

      for (const m of members) {
        // 1. Xác định troop: từ m.troop hoặc nếu m.troop trống thì tìm từ m.unit
        let troopVal = m.troop;
        if (!troopVal && m.unit) {
          const u =
            unitMap.get(String(m.unit)) ||
            unitMap.get(String(m.unit).trim().toLowerCase());
          if (u && u.troop) {
            troopVal = u.troop;
            m.troop = u.troop;
          }
        }

        // 2. Truy vấn ngược từ Đoàn (troop) -> Liên đoàn (group)
        if (troopVal) {
          const t =
            troopMap.get(String(troopVal)) ||
            troopMap.get(String(troopVal).trim().toLowerCase());
          if (t && t.group) {
            if (!m.group) {
              m.group = t.group;
            }
          }
        }

        // 3. Truy vấn ngược từ Liên đoàn (group) -> Đạo (district)
        if (m.group) {
          const g =
            groupMap.get(String(m.group)) ||
            groupMap.get(String(m.group).trim().toLowerCase());
          if (g && g.district) {
            if (!m.district) {
              m.district = g.district;
            }
          }
        }

        // 4. Truy vấn ngược từ Đạo (district) -> Châu (council)
        if (m.district) {
          const d =
            districtMap.get(String(m.district)) ||
            districtMap.get(String(m.district).trim().toLowerCase());
          if (d && d.council) {
            if (!m.council) {
              m.council = d.council;
            }
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(
        `Lỗi khi làm giàu thông tin thành viên từ đoàn: ${err?.message}`,
      );
    }

    return members;
  }

  /**
   * Lấy danh sách lựa chọn quan hệ (options cho select / lookup)
   */
  async getRelationOptions(rawName: string): Promise<RelationOption[]> {
    const table = this.normalizeTableName(rawName);
    const dbTable = this.getDbTableName(rawName);
    const supabase = this.supabaseService.getClient();

    const isMembers = table === 'members';
    const selectFields = isMembers ? 'id, full_name' : 'id, name';

    const { data, error } = await supabase
      .from(dbTable)
      .select(selectFields)
      .order('id', { ascending: true })
      .limit(1000);

    if (error) {
      this.logger.warn(
        `Lỗi lấy relation options cho bảng ${dbTable} (${table}): ${error.message}`,
      );
      return [];
    }

    return (data ?? []).map((row: any) => {
      const id = String(row.id);
      const label = String(row.name ?? row.full_name ?? id);
      return {
        id,
        name: label,
        value: id,
        label,
      };
    });
  }

  /**
   * Lấy chi tiết một bản ghi theo ID
   */
  async getRecordById(rawName: string, id: string | number) {
    const table = this.normalizeTableName(rawName);
    const dbTable = this.getDbTableName(rawName);
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from(dbTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(
          `Không tìm thấy bản ghi ID = ${id} trong bảng ${table}`,
        );
      }
      this.logger.error(
        `Lỗi truy vấn bản ghi ${id} trong ${dbTable} (${table}): ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        `Lỗi khi truy vấn bản ghi: ${error.message}`,
      );
    }

    if (table === 'members' && data) {
      await this.enrichMembersWithHierarchy([data]);
    }

    return data;
  }

  /**
   * Tạo bản ghi mới trong bảng
   */
  async createRecord(rawName: string, payload: Record<string, any>) {
    const table = this.normalizeTableName(rawName);
    const dbTable = this.getDbTableName(rawName);
    const supabase = this.supabaseService.getClient();
    const schema = this.getTableSchema(table);

    const cleanData: Record<string, any> = {};
    for (const col of schema) {
      if (['id', 'created_at', 'updated_at', 'nodeId'].includes(col.name))
        continue;
      if (payload[col.name] !== undefined) {
        let val = payload[col.name];
        if (val === '' && col.nullable) {
          val = null;
        } else if (
          (col.type === 'Int' || col.type === 'BigInt') &&
          val !== null &&
          val !== ''
        ) {
          val = !isNaN(Number(val)) ? Number(val) : val;
        } else if (col.type === 'Float' && val !== null && val !== '') {
          val = !isNaN(Number(val)) ? parseFloat(val) : val;
        }
        cleanData[col.name] = val;
      }
    }

    if (table === 'members') {
      delete cleanData.group;
      delete cleanData.district;
      delete cleanData.council;
      if (typeof cleanData.previous_sections === 'string') {
        cleanData.previous_sections = cleanData.previous_sections
          ? cleanData.previous_sections
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
      } else if (Array.isArray(cleanData.previous_sections)) {
        cleanData.previous_sections = cleanData.previous_sections
          .map((s: any) => String(s).trim())
          .filter(Boolean);
      }
    }

    const { data, error } = await supabase
      .from(dbTable)
      .insert(cleanData)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Lỗi tạo bản ghi trong ${dbTable} (${table}): ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        `Không thể tạo bản ghi trong ${table}: ${error.message}`,
      );
    }

    if (table === 'members' && data) {
      await this.enrichMembersWithHierarchy([data]);
    }

    return data;
  }

  /**
   * Cập nhật bản ghi theo ID
   */
  async updateRecord(
    rawName: string,
    id: string | number,
    payload: Record<string, any>,
  ) {
    const table = this.normalizeTableName(rawName);
    const dbTable = this.getDbTableName(rawName);
    const supabase = this.supabaseService.getClient();
    const schema = this.getTableSchema(table);

    const cleanData: Record<string, any> = {};
    for (const col of schema) {
      if (['id', 'created_at', 'updated_at', 'nodeId'].includes(col.name))
        continue;
      if (payload[col.name] !== undefined) {
        let val = payload[col.name];
        if (val === '' && col.nullable) {
          val = null;
        } else if (
          (col.type === 'Int' || col.type === 'BigInt') &&
          val !== null &&
          val !== ''
        ) {
          val = !isNaN(Number(val)) ? Number(val) : val;
        } else if (col.type === 'Float' && val !== null && val !== '') {
          val = !isNaN(Number(val)) ? parseFloat(val) : val;
        }
        cleanData[col.name] = val;
      }
    }

    if (table === 'members') {
      delete cleanData.group;
      delete cleanData.district;
      delete cleanData.council;
      if (typeof cleanData.previous_sections === 'string') {
        cleanData.previous_sections = cleanData.previous_sections
          ? cleanData.previous_sections
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [];
      } else if (Array.isArray(cleanData.previous_sections)) {
        cleanData.previous_sections = cleanData.previous_sections
          .map((s: any) => String(s).trim())
          .filter(Boolean);
      }
    }

    const { data, error } = await supabase
      .from(dbTable)
      .update(cleanData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `Lỗi cập nhật bản ghi ${id} trong ${dbTable} (${table}): ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        `Không thể cập nhật bản ghi trong ${table}: ${error.message}`,
      );
    }

    if (table === 'members' && data) {
      await this.enrichMembersWithHierarchy([data]);
    }

    return data;
  }

  /**
   * Xóa bản ghi theo ID
   */
  async deleteRecord(rawName: string, id: string | number) {
    const table = this.normalizeTableName(rawName);
    const dbTable = this.getDbTableName(rawName);
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from(dbTable).delete().eq('id', id);

    if (error) {
      this.logger.error(
        `Lỗi xóa bản ghi ${id} trong ${dbTable} (${table}): ${error.message}`,
        error,
      );
      throw new InternalServerErrorException(
        `Không thể xóa bản ghi trong ${table}: ${error.message}`,
      );
    }

    return {
      success: true,
      message: `Đã xóa bản ghi ${id} thành công.`,
    };
  }
}
