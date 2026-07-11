"use client";

import * as XLSX from "xlsx";
import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";

type ExportButtonsProps = {
  filenamePrefix: string;
  rows: Array<Record<string, string | number | null>>;
  sheetName: string;
};

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export function ExportButtons({
  filenamePrefix,
  rows,
  sheetName,
}: ExportButtonsProps) {
  const hasRows = rows.length > 0;

  function handleExportCsv() {
    const sheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    downloadBlob(blob, `${filenamePrefix}.csv`);
  }

  function handleExportXlsx() {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows);

    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);

    const output = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    const blob = new Blob([output], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    downloadBlob(blob, `${filenamePrefix}.xlsx`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExportCsv}
        disabled={!hasRows}
      >
        <Download className="size-4" />
        Export CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExportXlsx}
        disabled={!hasRows}
      >
        <FileSpreadsheet className="size-4" />
        Export XLSX
      </Button>
    </div>
  );
}
