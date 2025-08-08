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
import { UploadIcon, CheckCircle, CircleSlash2, FileText, X, Wifi, WifiOff, Clock, ShieldOff, ShieldUser } from 'lucide-react';
import { useState,useEffect,useCallback } from "react";
interface OpenVPNDialogProps {
  connected: boolean;
  timeRemaining?: number;
  fileName?: string;
  onSuccess: () => void;
  onDisconnect: () => void;
}

const OpenVPNDialog = ({ connected, timeRemaining, fileName, onSuccess, onDisconnect }: OpenVPNDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (file) return; 
    const selected = e.target.files?.[0];
    setError(null);
    setFile(selected ?? null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (file) return; 
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

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleConnect = async () => {
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
        credentials: 'include'
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

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/openvpn", {
        method: "DELETE",
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Disconnect failed");
      } else {
        onDisconnect();
      }
    } catch (err) {
      setError("Something went wrong during disconnect.");
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <DialogContent className="flex flex-col items-center gap-4 min-w-[320px] text-foreground">
        <DialogTitle className="font-semibold text-lg">OpenVPN Connection</DialogTitle>
        
        <div className="flex flex-col items-center gap-4 p-8 text-center w-full">
          <div className="flex items-center gap-3 text-green-600">
            <Wifi className="h-8 w-8" />
            <span className="text-lg font-medium">Connected</span>
          </div>
          
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{fileName}</span>
            </div>
          )}
          
          {timeRemaining !== undefined && timeRemaining > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Auto-disconnect in {formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Your VPN connection is active
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        
        <Button 
          onClick={handleDisconnect} 
          disabled={loading} 
          variant="destructive"
          className="w-full"
        >
          <WifiOff className="mr-2 h-4 w-4" />
          {loading ? "Disconnecting..." : "Disconnect"}
        </Button>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="flex flex-col items-center gap-4 min-w-[320px] text-foreground">
      <DialogTitle className="font-semibold text-lg">OpenVPN Connection</DialogTitle>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border border-dashed rounded p-8 text-center w-full cursor-pointer select-none hover:border-primary/50 transition-colors"
          onClick={() => document.getElementById("vpnFileInput")?.click()}
          aria-label="Drag and drop .ovpn file or click to select file"
        >
          <UploadIcon className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm">
            Drag & drop your <b>.ovpn</b> file here or click to upload.
          </p>
        </div>
      ) : (
        <div className="border rounded p-6 text-center w-full bg-muted/20">
          <div className="flex items-center justify-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="flex-1 text-left">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-8 w-8 p-0 hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Ready to connect with this configuration
          </p>
        </div>
      )}

      <input
        type="file"
        accept=".ovpn"
        id="vpnFileInput"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}
      
      {file && (
        <Button onClick={handleConnect} disabled={loading} className="w-full">
          <Wifi className="mr-2 h-4 w-4" />
          {loading ? "Connecting..." : "Connect"}
        </Button>
      )}
    </DialogContent>
  );
};

export function OpenVPNButton() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>();
  const [fileName, setFileName] = useState<string>();

  // connection status on mount
  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/openvpn", {
        method: "GET",
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const status = data.data;
        
        setConnected(status.connected);
        setTimeRemaining(status.timeRemaining);
        setFileName(status.fileName);
        
        if (!status.connected) {
          setTimeRemaining(undefined);
          setFileName(undefined);
        }
      }
    } catch (error) {
      console.error("Failed to check VPN status:", error);
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  useEffect(() => {
    if (!connected || timeRemaining === undefined) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === undefined || prev <= 1000) {
          checkStatus();
          return undefined;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [connected, timeRemaining, checkStatus]);

  const handleConnectionSuccess = () => {
    setConnected(true);
    setOpen(false);
    setTimeout(checkStatus, 1000);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setTimeRemaining(undefined);
    setFileName(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isMobile ? (
          <Button
            size="icon"
            variant="ghost"
            className={`rounded-sm p-2 transition shadow-lg ${
              connected ? "bg-green-500" : "bg-red-500"
            } text-white hover:opacity-80`}
            aria-label={connected ? "VPN Connected" : "VPN Not Connected"}
          >
            {connected ? <ShieldUser size={28} /> : <ShieldOff size={28} />}
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
                <ShieldUser size={20} className="mr-2" />
                Connected
              </>
            ) : (
              <>
                <ShieldOff size={20} className="mr-2" />
                Not Connected
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <OpenVPNDialog 
        connected={connected}
        timeRemaining={timeRemaining}
        fileName={fileName}
        onSuccess={handleConnectionSuccess} 
        onDisconnect={handleDisconnect}
      />
    </Dialog>
  );
}
