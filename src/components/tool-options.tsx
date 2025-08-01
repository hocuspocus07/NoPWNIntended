"use client"

import { useEffect } from "react"
import { NmapPanel } from "./tools/nmap-scan"
import { SubdomainPanel } from "./tools/subdomain-scan"
import { WhoisPanel } from "./tools/whois"
import { WebScanner } from "./tools/web-scanner"
import { SslScanner } from "./tools/ssl-scan"
import { DirectoryBruteForcer } from "./tools/directory-scanner"
import { SqlInjectionScanner } from "./tools/sqli-scanner"
import { XssTester } from "./tools/xss-tester"
import { EncoderDecoder } from "./tools/encoder-decoder"
import { HashCracker } from "./tools/hash-cracker"
import { JwtTool } from "./tools/jwt-encoder-decoder"
import { ForensicsTool } from "./tools/forensics"
import { ReverseEngineeringTool } from "./tools/reverse-engineering"
import { HoleheTool } from "./tools/holehe"
import { SherlockTool } from "./tools/sherlock"
import { ExifTool } from "./tools/exiftool"
interface ToolOptionsProps {
    activeTool: string | null
    onRegisterScan: (scanFn: () => Promise<string>) => void
    onToolChange?: () => void;
}

function ToolOptions({ activeTool, onRegisterScan, onToolChange }: ToolOptionsProps) {
    useEffect(() => {
        if (onToolChange) {
            onToolChange();
        }
    }, [activeTool, onToolChange]);
    const handleEncoderDecoderOutput = (output: string) => {
        console.log("Encoder/Decoder output:", output)
    }

    return (
        <div className="text-foreground">
            {activeTool === "port-scanner" && (
                <NmapPanel onRegisterScan={onRegisterScan} />)}
            {activeTool === "subdomain-finder" && <SubdomainPanel onRegisterScan={onRegisterScan} />}
            {activeTool === "whois-lookup" && <WhoisPanel onRegisterScan={onRegisterScan} />}
            {/* {activeTool === "web-scanner" && <WebScanner onRegisterScan={onRegisterScan}/>} */}
            {activeTool === "ssl-analyzer" && <SslScanner onRegisterScan={onRegisterScan} />}
            {activeTool === "directory-brute-forcer" && <DirectoryBruteForcer onRegisterScan={onRegisterScan}/>}
            {activeTool === "sqli-scanner" && <SqlInjectionScanner />}
            {activeTool === "xss-tester" && <XssTester />}
            {activeTool === "encoder/decoder" && <EncoderDecoder onOutputChange={handleEncoderDecoderOutput} />}
            {activeTool === "hash-cracker" && <HashCracker onRegisterScan={onRegisterScan}/>}
            {activeTool === "jwt-encoder/decoder" && <JwtTool />}
            {activeTool === "forensics-tool" && <ForensicsTool onRegisterScan={onRegisterScan}/>}
            {activeTool === "reverse-engineering" && <ReverseEngineeringTool onRegisterScan={onRegisterScan}/>}
            {activeTool === "holehe" && <HoleheTool onRegisterScan={onRegisterScan} />}
            {activeTool === "sherlock" && <SherlockTool onRegisterScan={onRegisterScan} />}
            {activeTool === "exiftool" && <ExifTool onRegisterScan={onRegisterScan} />}
            {!activeTool && <div>Select a tool from the sidebar</div>}
        </div>
    )
}

export default ToolOptions