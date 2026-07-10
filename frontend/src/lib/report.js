// Neo-brutalist palette (RGB) for the PDF.
const INK = [23, 30, 25];
const BRAND = [255, 225, 124];
const SAGE = [183, 198, 194];
const PAPER = [250, 249, 245];

/**
 * Generate and download a one-file PDF research report for a verdict.
 * jsPDF is imported dynamically so it never runs during SSR.
 */
export async function downloadVerdictReport(verdict) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text) => {
    ensureSpace(34);
    doc.setFillColor(...INK);
    doc.rect(margin, y, contentW, 24, "F");
    doc.setTextColor(...BRAND);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(text.toUpperCase(), margin + 8, y + 16);
    y += 36;
  };

  const paragraph = (text, size = 10) => {
    if (!text) return;
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, contentW - 4);
    for (const line of lines) {
      ensureSpace(size + 4);
      doc.text(line, margin + 2, y);
      y += size + 4;
    }
    y += 4;
  };

  const bullets = (items) => {
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const item of items) {
      const lines = doc.splitTextToSize(item, contentW - 18);
      lines.forEach((line, i) => {
        ensureSpace(14);
        if (i === 0) doc.text("•", margin + 4, y);
        doc.text(line, margin + 16, y);
        y += 14;
      });
    }
    y += 4;
  };

  // ---- Title band ----
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageW, 96, "F");
  doc.setDrawColor(...INK);
  doc.setLineWidth(2);
  doc.line(0, 96, pageW, 96);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("VERDICT — INVESTMENT RESEARCH", margin, 44);
  doc.setFontSize(16);
  doc.text(verdict.company, margin, 70);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(new Date().toLocaleString(), pageW - margin, 70, { align: "right" });
  y = 120;

  // ---- Decision box ----
  ensureSpace(70);
  const isInvest = verdict.decision === "INVEST";
  doc.setFillColor(...(isInvest ? BRAND : INK));
  doc.setDrawColor(...INK);
  doc.setLineWidth(2);
  doc.rect(margin, y, contentW, 56, "FD");
  doc.setTextColor(...(isInvest ? INK : PAPER));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(verdict.decision, margin + 12, y + 36);
  doc.setFontSize(11);
  doc.text(
    `Confidence: ${verdict.confidence}%    Risk: ${verdict.riskLevel}`,
    pageW - margin - 12,
    y + 34,
    { align: "right" },
  );
  y += 72;

  // ---- Overview ----
  heading("Company Overview");
  if (verdict.overview.oneLiner) paragraph(verdict.overview.oneLiner);
  const ov = verdict.overview;
  const facts = [
    ["Sector", ov.sector],
    ["Headquarters", ov.headquarters],
    ["Founded", ov.founded],
    ["Employees", ov.employees],
    ["CEO", ov.ceo],
  ];
  doc.setFontSize(10);
  for (const [k, v] of facts) {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(`${k}:`, margin + 2, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(v || "—"), margin + 110, y);
    y += 15;
  }
  y += 6;

  // ---- Thesis ----
  heading("Investment Thesis");
  paragraph(verdict.thesis);

  // ---- Bull / Bear ----
  if (verdict.bullCase.length) {
    heading("Bull Case");
    bullets(verdict.bullCase);
  }
  if (verdict.bearCase.length) {
    heading("Bear Case");
    bullets(verdict.bearCase);
  }

  // ---- Score breakdown (simple bar rows) ----
  if (verdict.scoreBreakdown.length) {
    heading("Score Breakdown");
    for (const s of verdict.scoreBreakdown) {
      ensureSpace(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...INK);
      doc.text(s.label, margin + 2, y + 9);
      const barX = margin + 110;
      const barW = contentW - 150;
      doc.setDrawColor(...INK);
      doc.setLineWidth(1);
      doc.setFillColor(...SAGE);
      doc.rect(barX, y, barW, 11, "FD");
      doc.setFillColor(...INK);
      doc.rect(barX, y, (barW * s.score) / 100, 11, "F");
      doc.text(`${s.score}`, barX + barW + 8, y + 9);
      y += 18;
    }
    y += 6;
  }

  // ---- Financials ----
  if (verdict.financialSeries.length) {
    heading("Financial Overview (est., $B)");
    doc.setFontSize(10);
    ensureSpace(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text("Year", margin + 2, y);
    doc.text("Revenue", margin + 150, y);
    doc.text("Net Income", margin + 290, y);
    y += 15;
    doc.setFont("helvetica", "normal");
    for (const p of verdict.financialSeries) {
      ensureSpace(14);
      doc.text(String(p.year), margin + 2, y);
      doc.text(`$${p.revenue}B`, margin + 150, y);
      doc.text(`$${p.netIncome}B`, margin + 290, y);
      y += 14;
    }
    y += 6;
  }

  // ---- News ----
  if (verdict.news.length) {
    heading("Latest News");
    for (const n of verdict.news) {
      ensureSpace(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...INK);
      const titleLines = doc.splitTextToSize(
        `[${n.sentiment.toUpperCase()}] ${n.title}`,
        contentW - 4,
      );
      for (const line of titleLines) {
        ensureSpace(13);
        doc.text(line, margin + 2, y);
        y += 13;
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const sumLines = doc.splitTextToSize(n.summary, contentW - 4);
      for (const line of sumLines) {
        ensureSpace(12);
        doc.text(line, margin + 2, y);
        y += 12;
      }
      y += 6;
    }
  }

  // ---- Research trail ----
  heading("Research Detail");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  ensureSpace(14);
  doc.text("Company profile", margin + 2, y);
  y += 14;
  paragraph(verdict.research.profile, 9);
  doc.setFont("helvetica", "bold");
  ensureSpace(14);
  doc.text("Financials", margin + 2, y);
  y += 14;
  paragraph(verdict.research.financials, 9);
  doc.setFont("helvetica", "bold");
  ensureSpace(14);
  doc.text("Risks & moat", margin + 2, y);
  y += 14;
  paragraph(verdict.research.risks, 9);

  // ---- Footer disclaimer ----
  ensureSpace(20);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Generated by Verdict AI. Not financial advice — illustrative research demo only.",
    margin,
    pageH - margin + 10,
  );

  const safe = verdict.company.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`verdict-${safe}.pdf`);
}
