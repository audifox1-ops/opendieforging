import { NextRequest, NextResponse } from "next/server";
import { specService } from "@/lib/supabase/specService";
import { renderToStream } from "@react-pdf/renderer";
import SpecPdfDocument from "@/components/pdf/SpecPdfDocument";
import React from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // 1. 시방서 데이터 조회
    const spec = await specService.getSpecById(id);
    if (!spec) return NextResponse.json({ error: "Specification not found" }, { status: 404 });

    // 2. PDF 스트림 생성
    // @ts-ignore
    const stream = await renderToStream(React.createElement(SpecPdfDocument, { spec }));

    // 3. 응답 반환
    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Spec_${spec.doc_number}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF 생성 에러:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    );
  }
}
