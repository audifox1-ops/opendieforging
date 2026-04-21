-- 태웅 15,000T 프레스 시방서 테이블 정의
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요.

-- 1. 시방서 마스터 테이블
CREATE TABLE IF NOT EXISTS specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_number TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFTING' CHECK (status IN ('DRAFTING', 'REVIEW_REQUESTED', 'APPROVED', 'REJECTED')),
  current_revision INT DEFAULT 1,
  form_data JSONB NOT NULL,
  ai_suggestion JSONB,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 시방서 리비전 이력 테이블
CREATE TABLE IF NOT EXISTS spec_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_id UUID REFERENCES specifications(id) ON DELETE CASCADE,
  revision INT NOT NULL,
  changed_by TEXT,
  change_summary TEXT,
  form_snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row Level Security (RLS) 설정 - 간단히 활성화 (인증 없는 앱의 경우 주의)
ALTER TABLE specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE spec_revisions ENABLE ROW LEVEL SECURITY;

-- 누구나 읽고 쓸 수 있는 정책 (로컬 테스트 및 사내망용 프로토타입)
CREATE POLICY "Allow public access" ON specifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON spec_revisions FOR ALL USING (true) WITH CHECK (true);

-- 4. 업데이트 시각 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_specifications_updated_at BEFORE UPDATE ON specifications
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
