import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { generateWorkSteps } from "@/lib/instructionParser";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff" },
  header: { marginBottom: 20, borderBottom: 2, borderColor: "#000000", paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subTitle: { fontSize: 12, color: "#666" },
  section: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", backgroundColor: "#f0f0f0", padding: 5, marginBottom: 10 },
  infoGrid: { display: "flex", flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  infoItem: { width: "50%", marginBottom: 8 },
  label: { fontSize: 8, color: "#888", textTransform: "uppercase" },
  value: { fontSize: 11, fontWeight: "bold" },
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#000", borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: { width: "10%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: "#f0f0f0", padding: 5 },
  tableColDesc: { width: "40%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableColTarget: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableColActual: { width: "25%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 5 },
  tableCellHeader: { fontSize: 9, fontWeight: "bold" },
  tableCell: { fontSize: 9 },
  signSection: { marginTop: 40, display: "flex", flexDirection: "row", justifyContent: "flex-end" },
  signBox: { width: 150, height: 80, border: 1, borderColor: "#000", marginLeft: 20, display: "flex", alignItems: "center", justifyContent: "center" },
  signLabel: { fontSize: 8, marginTop: 5 }
});

const WorkInstructionPdfDocument = ({ spec }: { spec: any }) => {
  const steps = generateWorkSteps(spec.ai_suggestion.suggestion);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>WORK INSTRUCTION</Text>
          <Text style={styles.subTitle}>현장 작업지시서 - Taewoong 15,000T Press Edition</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Document No.</Text>
            <Text style={styles.value}>{spec.doc_number}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Product Name</Text>
            <Text style={styles.value}>{spec.product_name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Material / Shape</Text>
            <Text style={styles.value}>{spec.form_data.material} / {spec.form_data.shape}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>작업 공정 순서 (Operation Sequence)</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>No.</Text></View>
              <View style={styles.tableColDesc}><Text style={styles.tableCellHeader}>작업 내용 (Description)</Text></View>
              <View style={styles.tableColTarget}><Text style={styles.tableCellHeader}>표준/Target</Text></View>
              <View style={styles.tableColActual}><Text style={styles.tableCellHeader}>실측치 (Actual)</Text></View>
            </View>
            {steps.map((step, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={styles.tableColHeader}><Text style={styles.tableCell}>{step.id}</Text></View>
                <View style={styles.tableColDesc}>
                  <Text style={{ fontSize: 10, fontWeight: "bold" }}>{step.title}</Text>
                  <Text style={{ fontSize: 8, color: "#444", marginTop: 2 }}>{step.description}</Text>
                </View>
                <View style={styles.tableColTarget}><Text style={styles.tableCell}>{step.target}</Text></View>
                <View style={styles.tableColActual}><Text style={styles.tableCell}></Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>특기사항 (Notes)</Text>
          <Text style={{ fontSize: 9 }}>{spec.form_data.remarks || "N/A"}</Text>
        </View>

        <View style={styles.signSection}>
          <View style={{ display: "flex", alignItems: "center" }}>
            <View style={styles.signBox}></View>
            <Text style={styles.signLabel}>검토 (Reviewed by)</Text>
          </View>
          <View style={{ display: "flex", alignItems: "center" }}>
            <View style={styles.signBox}></View>
            <Text style={styles.signLabel}>승인 (Approved by)</Text>
          </View>
          <View style={{ display: "flex", alignItems: "center" }}>
            <View style={styles.signBox}></View>
            <Text style={styles.signLabel}>작업자 (Operator)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default WorkInstructionPdfDocument;
