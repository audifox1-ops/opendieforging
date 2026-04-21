import { supabase } from "./client";

export interface Specification {
  id?: string;
  doc_number: string;
  product_name: string;
  status: "DRAFTING" | "REVIEW_REQUESTED" | "APPROVED" | "REJECTED";
  current_revision: number;
  form_data: any;
  ai_suggestion: any;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface SpecRevision {
  id?: string;
  spec_id: string;
  revision: number;
  changed_by: string;
  change_summary: string;
  form_snapshot: any;
  created_at?: string;
}

export const specService = {
  /**
   * 모든 시방서 가져오기
   */
  async getSpecs() {
    const { data, error } = await supabase
      .from("specifications")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching specs:", error);
      throw error;
    }
    return data as Specification[];
  },

  /**
   * 특정 문서 가져오기
   */
  async getSpecById(id: string) {
    const { data, error } = await supabase
      .from("specifications")
      .select("*, spec_revisions(*)")
      .eq("id", id)
      .order("revision", { foreignTable: "spec_revisions", ascending: false })
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 신규 시방서 생성
   */
  async createSpec(spec: Omit<Specification, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("specifications")
      .insert([spec])
      .select()
      .single();

    if (error) throw error;

    // 초기 리비전 생성
    await this.createRevision({
      spec_id: data.id,
      revision: spec.current_revision,
      changed_by: spec.created_by,
      change_summary: "최초 작성",
      form_snapshot: spec.form_data,
    });

    return data;
  },

  /**
   * 시방서 업데이트 및 리비전 생성
   */
  async updateSpec(
    id: string,
    updates: Partial<Specification>,
    changeSummary: string = "정보 수정"
  ) {
    // 1. 현재 문서 정보 가져오기 (리비전 번호 등)
    const { data: current } = await supabase
      .from("specifications")
      .select("current_revision, created_by")
      .eq("id", id)
      .single();

    if (!current) throw new Error("Specification not found");

    const nextRevision = current.current_revision + 1;

    // 2. 사방서 업데이트
    const { data, error } = await supabase
      .from("specifications")
      .update({
        ...updates,
        current_revision: nextRevision,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // 3. 리비전 기록 추가
    await this.createRevision({
      spec_id: id,
      revision: nextRevision,
      changed_by: updates.created_by || "System",
      change_summary: changeSummary,
      form_snapshot: updates.form_data || data.form_data,
    });

    return data;
  },

  /**
   * 상태 변경 전용 (검토 요청 / 승인)
   */
  async updateStatus(id: string, status: Specification["status"], changedBy: string) {
    const { data, error } = await supabase
      .from("specifications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 리비전 생성 내부 함수
   */
  async createRevision(revision: Omit<SpecRevision, "id" | "created_at">) {
    const { error } = await supabase.from("spec_revisions").insert([revision]);
    if (error) throw error;
  },

  /**
   * 특정 시방서의 최신 작업 로그(Instruction 실적) 가져오기
   */
  async getWorkLog(specId: string) {
    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .eq("spec_id", specId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * 신규 작업 로그 생성 (작업 시작)
   */
  async createWorkLog(specId: string, steps: any[], operator: string) {
    const { data, error } = await supabase
      .from("work_logs")
      .insert([{
        spec_id: specId,
        steps,
        operator_name: operator,
        status: "IN_PROGRESS"
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 작업 로그 업데이트 (단계 완료 및 실적 입력)
   */
  async updateWorkLog(id: string, updates: any) {
    const { data, error } = await supabase
      .from("work_logs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
