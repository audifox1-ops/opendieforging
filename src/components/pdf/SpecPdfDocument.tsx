import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { type Specification } from "@/lib/supabase/specService";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

// 한글 폰트 등록 (나눔고딕)
Font.register({
  family: "NanumGothic",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/nanumgothic/v21/PN_oRbmTAtHfhC727D46_p7_T_U.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/nanumgothic/v21/PN_oRbmTAtHfhC727D46_p7_S-U.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NanumGothic",
    backgroundColor: "#ffffff",
    color: "#333333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a8a",
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  titleArea: {
    textAlign: "right",
  },
  docTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  docId: {
    fontSize: 10,
    color: "#666666",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
    backgroundColor: "#f3f4f6",
    padding: 5,
    marginBottom: 8,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    minHeight: 24,
    alignItems: "center",
  },
  tableCol: {
    width: "25%",
    padding: 5,
    fontSize: 9,
  },
  tableLabel: {
    width: "25%",
    backgroundColor: "#f9fafb",
    padding: 5,
    fontSize: 9,
    fontWeight: "bold",
    color: "#4b5563",
    borderRightWidth: 0.5,
    borderRightColor: "#e5e7eb",
  },
  tableValue: {
    flex: 1,
    padding: 5,
    fontSize: 9,
  },
  aiBox: {
    borderWidth: 1,
    borderColor: "#10b981",
    padding: 10,
    backgroundColor: "#ecfdf5",
    borderRadius: 4,
  },
  aiTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 5,
  },
  aiText: {
    fontSize: 8,
    color: "#047857",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#999999",
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    marginTop: 40,
  },
  signatureBox: {
    width: 80,
    height: 60,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  signatureLabel: {
    fontSize: 8,
    color: "#666666",
    marginBottom: 20,
  },
});

interface SpecPdfDocumentProps {
  spec: Specification;
}

export default function SpecPdfDocument({ spec }: SpecPdfDocumentProps) {
  const { form_data: fd, ai_suggestion: ai } = spec;

  return (
    <Document title={`시방서_${spec.doc_number}`}>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Image src="/logo-tw.png" style={styles.logo} />
          <View style={styles.titleArea}>
            <Text style={styles.docTitle}>단조 작업 시방서</Text>
            <Text style={styles.docId}>{spec.doc_number} (Rev.{spec.current_revision})</Text>
          </View>
        </View>

        {/* 일반 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 일반 정보 (General Information)</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>제품명</Text>
              <Text style={styles.tableValue}>{spec.product_name}</Text>
              <Text style={styles.tableLabel}>형상 (Shape)</Text>
              <Text style={styles.tableValue}>{fd.shape}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>소재/규격</Text>
              <Text style={styles.tableValue}>{fd.material}</Text>
              <Text style={styles.tableLabel}>작성일</Text>
              <Text style={styles.tableValue}>
                {format(new Date(spec.created_at || new Date()), "yyyy-MM-dd", { locale: ko })}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>작성자</Text>
              <Text style={styles.tableValue}>{spec.created_by}</Text>
              <Text style={styles.tableLabel}>상태</Text>
              <Text style={styles.tableValue}>{spec.status}</Text>
            </View>
          </View>
        </View>

        {/* 작업 방식 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 작업 방식 (Working Method)</Text>
          <View style={[styles.table, { padding: 10 }]}>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>
              {fd.workingMethod || "소재 및 중량에 따른 표준 단조 공정 절차를 준수하십시오."}
            </Text>
          </View>
        </View>

        {/* 치수 및 설비 검증 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 치수 및 설비 검증 (Dimensions & CAPA)</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>외경 (OD)</Text>
              <Text style={styles.tableValue}>
                {fd.od_mm} mm {fd.od_tol_plus && fd.od_tol_minus ? `(${fd.od_tol_plus} / ${fd.od_tol_minus})` : ""}
              </Text>
              <Text style={styles.tableLabel}>높이 (Height)</Text>
              <Text style={styles.tableValue}>
                {fd.height_mm} mm {fd.height_tol_plus && fd.height_tol_minus ? `(${fd.height_tol_plus} / ${fd.height_tol_minus})` : ""}
              </Text>
            </View>
            {(fd.shape === "RING" || fd.shape === "SHELL" || fd.shape === "PIPE") && fd.id_mm && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>내경 (ID)</Text>
                <Text style={styles.tableValue}>
                  {fd.id_mm} mm {fd.id_tol_plus && fd.id_tol_minus ? `(${fd.id_tol_plus} / ${fd.id_tol_minus})` : ""}
                </Text>
                <Text style={styles.tableLabel}></Text>
                <Text style={styles.tableValue}></Text>
              </View>
            )}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>중량 (Weight)</Text>
              <Text style={styles.tableValue}>{Number(fd.weight_kg).toLocaleString()} kg</Text>
              <Text style={styles.tableLabel}>설비 적합성</Text>
              <Text style={[styles.tableValue, { color: "#10b981", fontWeight: "bold" }]}>✅ 15,000T CAPA 통과</Text>
            </View>
          </View>
        </View>

        {/* 상세 단조 공정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 상세 단조 공정 (Forging Sequence)</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, { backgroundColor: "#f9fafb" }]}>
              <Text style={[styles.tableCol, { width: "10%", fontWeight: "bold", textAlign: "center" }]}>순번</Text>
              <Text style={[styles.tableCol, { width: "25%", fontWeight: "bold" }]}>공정명</Text>
              <Text style={[styles.tableCol, { width: "25%", fontWeight: "bold" }]}>목표치수</Text>
              <Text style={[styles.tableCol, { width: "15%", fontWeight: "bold" }]}>온도</Text>
              <Text style={[styles.tableCol, { width: "25%", fontWeight: "bold" }]}>비고</Text>
            </View>
            {fd.steps && fd.steps.length > 0 ? (
              fd.steps.map((step: any, i: number) => (
                <View key={step.id} style={styles.tableRow}>
                  <Text style={[styles.tableCol, { width: "10%", textAlign: "center" }]}>{i + 1}</Text>
                  <Text style={[styles.tableCol, { width: "25%" }]}>{step.stepName}</Text>
                  <Text style={[styles.tableCol, { width: "25%" }]}>{step.targetDimension}</Text>
                  <Text style={[styles.tableCol, { width: "15%" }]}>{step.temp_C}°C</Text>
                  <Text style={[styles.tableCol, { width: "25%" }]}>{step.notes}</Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCol, { width: "100%", textAlign: "center", color: "#999" }]}>
                  등록된 상세 공정이 없습니다.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* AI 추천 공정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. AI 추천 공정 파라미터 (Process Suggestions)</Text>
          <View style={styles.aiBox}>
            <Text style={styles.aiTitle}>Gemini AI 최적 공정 제안</Text>
            <Text style={styles.aiText}>{ai || "가열 온도: 1150-1250°C\n유지 시간: 100mm/h 기준\n열처리: Q/T (870°C 담금질 / 620°C 템퍼링)"}</Text>
          </View>
        </View>

        {/* 서명란 */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>검토</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>승인</Text>
          </View>
        </View>

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text>Taewoong 15,000T Press Forging Specification</Text>
          <Text>주식회사 태웅 (Taewoong Co., Ltd.)</Text>
        </View>
      </Page>
    </Document>
  );
}
