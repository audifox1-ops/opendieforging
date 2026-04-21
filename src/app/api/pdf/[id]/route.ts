import { NextRequest, NextResponse } from "next/server";
import { specService } from "@/lib/supabase/specService";
import { renderToStream } from "@react-pdf/renderer";
import SpecPdfDocument from "@/components/pdf/SpecPdfDocument";
import WorkInstructionPdfDocument from "@/components/pdf/WorkInstructionPdfDocument";
import React from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // 1. 시방서 데이터 조회
    const spec = await specService.getSpecById(id);
    if (!spec) return NextResponse.json({ error: "Specification not found" }, { status: 404 });

    // 2. PDF 컴포넌트 선택
    const isInstruction = type === "instruction";
    const documentElement = isInstruction 
      ? React.createElement(WorkInstructionPdfDocument, { spec })
      : React.createElement(SpecPdfDocument, { spec });

    // 3. PDF 스트림 생성
    // @ts-ignore
    const stream = await renderToStream(documentElement);

    // 4. 응답 반환
    const filename = isInstruction ? `WorkInst_${spec.doc_number}.pdf` : `Spec_${spec.doc_number}.pdf`;
    
    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
