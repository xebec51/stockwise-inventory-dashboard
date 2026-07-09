"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProductQrDialogProps = {
  label: string;
  value: string;
};

export function ProductQrDialog({ label, value }: ProductQrDialogProps) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      width: 320,
      margin: 2,
    })
      .then((nextDataUrl) => {
        if (active) {
          setDataUrl(nextDataUrl);
        }
      })
      .catch(() => {
        if (active) {
          setDataUrl("");
        }
      });

    return () => {
      active = false;
    };
  }, [value]);

  function handleDownload() {
    if (!dataUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = dataUrl;
    link.download = `${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-qr.png`;
    link.click();
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <QrCode className="size-4" />
        QR
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label} QR label</DialogTitle>
          <DialogDescription>
            This QR encodes <strong>{value}</strong> for label printing or
            warehouse scanning.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`${label} QR code`}
              className="size-64 rounded-3xl border border-border/70 bg-white p-4"
            />
          ) : (
            <div className="flex size-64 items-center justify-center rounded-3xl border border-dashed border-border/70 text-sm text-muted-foreground">
              Generating QR label...
            </div>
          )}

          <div className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3 text-center text-sm text-muted-foreground">
            Use this label for scan-ready product identification across receiving,
            storage, and outbound workflows.
          </div>

          <Button type="button" onClick={handleDownload} disabled={!dataUrl}>
            <Download className="size-4" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
