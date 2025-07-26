"use client"

import { useEffect } from "react"
import { NmapPanel } from "./tools/nmap-scan"
import { SubdomainPanel } from "./tools/subdomain-scan"
import { WhoisPanel } from "./tools/whois"
import { WebScannerPanel } from "./tools/web-scanner"
import { SslScannerPanel } from "./tools/ssl-scan"
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
}

function ToolOptions({ activeTool, onRegisterScan }: ToolOptionsProps) {
    useEffect(() => {
        const registerScanFunction = async () => {
            if (activeTool === "port-scanner") {
                onRegisterScan(async () => {
                    await new Promise((res) => setTimeout(res, 1000))
                    return `hi`
                })
            } else if (activeTool === "subdomain-finder") {
                onRegisterScan(async () => {
                    await new Promise((res) => setTimeout(res, 1000))
                    return `hi`
                })
            } else if (activeTool === "whois-lookup") {
                onRegisterScan(async () => {
                    return `hi`
                })
            } else if (activeTool === "web-scanner") {
                onRegisterScan(async () => {
                    console.log("hi")
                    return "hi"
                })
            } else if (activeTool === "ssl-analyzer") {
                onRegisterScan(async () => {
                    console.log("hi")
                    return "hi"
                })
            }  else if (activeTool === "directory-brute-forcer") {
                onRegisterScan(async () => {
                    console.log("hi")
                    return "hi"
                })
            } else if (activeTool === "sqli-scanner") {
                onRegisterScan(async () => {
                    console.log("hi")
                    return "hi"
                })
            } else if (activeTool === "xss-tester") {
                onRegisterScan(async () => {
                    console.log("hi")
                    return "hi"
                })
            }else if (activeTool === "encoder/decoder") {
                onRegisterScan(async () => {
                    console.log("hi")
                    return "hi"
                })
            }else if (activeTool === "hash-cracker") {
                onRegisterScan(async () => {
                    console.log("hi")
                    return "hi"
                })
            }else {
                onRegisterScan(async () => "Please select a valid tool")
            }
        }

        registerScanFunction()
    }, [activeTool, onRegisterScan])

    const handleEncoderDecoderOutput = (output: string) => {
        console.log("Encoder/Decoder output:", output)
    }

    return (
        <div className="text-foreground">
            {activeTool === "port-scanner" && (
                <NmapPanel
                    target="192.168.1.1"
                    onCommandGenerated={(command) => console.log("Generated:", command)}
                />
            )}
            {activeTool === "subdomain-finder" && <SubdomainPanel />}
            {activeTool === "whois-lookup" && <WhoisPanel />}
            {activeTool === "web-scanner" && <WebScannerPanel />}
            {activeTool === "ssl-analyzer" && <SslScannerPanel />}
            {activeTool === "directory-brute-forcer" && <DirectoryBruteForcer />}
            {activeTool === "sqli-scanner" && <SqlInjectionScanner />}
            {activeTool === "xss-tester" && <XssTester /> }
            {activeTool === "encoder/decoder" && <EncoderDecoder onOutputChange={handleEncoderDecoderOutput} />}
            {activeTool==="hash-cracker" && <HashCracker onOutputChange={handleEncoderDecoderOutput} />}
            {activeTool==="jwt-encoder/decoder" && <JwtTool/>}
            {activeTool==="forensics-tool" && <ForensicsTool/>}
            {activeTool==="reverse-engineering" && <ReverseEngineeringTool/>}
            {activeTool==="holehe"&& <HoleheTool/>}
            {activeTool==="sherlock"&& <SherlockTool/>}
            {activeTool==="exiftool" && <ExifTool/>}
            {!activeTool && <div>Select a tool from the sidebar</div>}
        </div>
    )
}

export default ToolOptions