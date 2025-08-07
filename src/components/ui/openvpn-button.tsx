"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { UploadIcon, CheckCircle, CircleSlash2 } from "lucide-react";

const OpenVPNDialog = ({ onSuccess }: { onSuccess: () => void }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setError(null);
    setFile(selected ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".ovpn")) {
        setFile(droppedFile);
      } else {
        setError("Only .ovpn files are supported");
        setFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a .ovpn file first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/openvpn", {
        method: "POST",
        body: formData,
        credentials:'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed");
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("Something went wrong during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="flex flex-col items-center gap-4 min-w-[320px] text-foreground">
      <DialogTitle className="font-semibold text-lg">OpenVPN Connection</DialogTitle>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border border-dashed rounded p-8 text-center w-full cursor-pointer select-none"
        onClick={() => document.getElementById("vpnFileInput")?.click()}
        aria-label="Drag and drop .ovpn file or click to select file"
      >
        <UploadIcon className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm">
          Drag & drop your <b>.ovpn</b> file here or click to upload.
        </p>
        {file && <p className="mt-2 font-medium truncate">{file.name}</p>}
      </div>

      <input
        type="file"
        accept=".ovpn"
        id="vpnFileInput"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Connecting..." : "Connect"}
      </Button>
    </DialogContent>
  );
};

export function OpenVPNButton() {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [connected, setConnected] = React.useState(false);

  const handleConnectionSuccess = () => {
    setConnected(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isMobile ? (
          <Button
            size="icon"
            variant="ghost"
            className={`rounded-full p-2 transition shadow-lg ${
              connected ? "bg-green-500" : "bg-red-500"
            } text-white hover:opacity-80`}
            aria-label={connected ? "VPN Connected" : "VPN Not Connected"}
          >
            {connected ? <CheckCircle size={28} /> : <CircleSlash2 size={28} />}
          </Button>
        ) : (
          <Button
            variant="ghost"
            className={`rounded-full px-4 py-2 text-white shadow transition ${
              connected ? "bg-green-500" : "bg-red-500"
            } flex items-center gap-2`}
          >
            {connected ? (
              <>
                <CheckCircle size={20} className="mr-2" />
                Connected
              </>
            ) : (
              <>
                <CircleSlash2 size={20} className="mr-2" />
                Not Connected
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <OpenVPNDialog onSuccess={handleConnectionSuccess} />
    </Dialog>
  );
}
