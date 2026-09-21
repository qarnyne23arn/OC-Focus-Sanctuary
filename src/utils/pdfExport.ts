import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function handleExportReport(
  reportElementRef: React.RefObject<HTMLDivElement | null>,
  reportType = 'daily',
  dateLabel = new Date().toISOString().slice(0, 10)
) {
  const hasRef = !!reportElementRef.current;
  console.log("Export Report clicked. Ref present:", hasRef);
  if (!hasRef) {
    console.error("Export aborted: report container ref is null");
    alert("Export failed: report content not found. Please try again.");
    return;
  }

  try {
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(reportElementRef.current, {
      backgroundColor: "#0f1115",
      useCORS: true,
      scale: 2,
      windowWidth: reportElementRef.current.scrollWidth,
      windowHeight: reportElementRef.current.scrollHeight
    });

    console.log("Canvas captured, width:", canvas.width, "height:", canvas.height);
    const imgData = canvas.toDataURL("image/png");
    console.log("Image data length:", imgData.length);

    if (imgData.length < 5000) {
      console.error("Captured canvas appears blank");
      return;
    }

    const pdfWidth = canvas.width * 0.75 / 2;
    const pdfHeight = canvas.height * 0.75 / 2;
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight]
    });
    pdf.setFillColor(15, 17, 21);
    pdf.rect(0, 0, pdfWidth, pdfHeight, "F");
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`focus-sanctuary-report-${reportType}-${dateLabel}.pdf`);
    console.log("Export Report: PDF save triggered");
  } catch (err: any) {
    console.error("Export Report failed:", err?.message || err);
  }
}
