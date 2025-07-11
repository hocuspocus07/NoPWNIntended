// utils/encoding-helpers.ts
import * as forge from 'node-forge'
import { Buffer } from 'buffer'

export const encodeDecodeBase64 = (input: string, operation: 'encode' | 'decode'): string => {
  return operation === 'encode'
    ? Buffer.from(input).toString('base64')
    : Buffer.from(input, 'base64').toString('utf8')
}

export const encodeDecodeUrl = (input: string, operation: 'encode' | 'decode'): string => {
  return operation === 'encode'
    ? encodeURIComponent(input)
    : decodeURIComponent(input)
}

export const encodeDecodeHtml = (input: string, operation: 'encode' | 'decode'): string => {
  return operation === 'encode'
    ? input.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m] ?? m))
    : input.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, m => ({
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
      }[m] ?? m))
}

export const encodeDecodeHex = (input: string, operation: 'encode' | 'decode'): string => {
  if (operation === "encode") {
    return Array.from(input).map(c => 
      c.charCodeAt(0).toString(16).padStart(2, '0')
    ).join(' ')
  } else {
    return input.split(' ').map(hex =>
      String.fromCharCode(parseInt(hex, 16))
    ).join('')
  }
}

export const encodeDecodeBinary = (input: string, operation: 'encode' | 'decode'): string => {
  if (operation === "encode") {
    return Array.from(input).map(c => 
      c.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ')
  } else {
    return input.split(' ').map(bin =>
      String.fromCharCode(parseInt(bin, 2))
    ).join('')
  }
}

export const hashMd5 = (input: string): string => {
  return forge.md.md5.create().update(input).digest().toHex()
}

export const hashSha1 = (input: string): string => {
  return forge.md.sha1.create().update(input).digest().toHex()
}

export const hashSha256 = (input: string): string => {
  return forge.md.sha256.create().update(input).digest().toHex()
}

export const rot13 = (input: string): string => {
  return input.replace(/[a-zA-Z]/g, c => {
    const code = c.charCodeAt(0)
    const base = c <= 'Z' ? 90 : 122
    const shifted = code + 13
    return String.fromCharCode(base >= shifted ? shifted : shifted - 26)
  })
}

export const encodeDecodeAscii = (input: string, operation: 'encode' | 'decode'): string => {
  if (operation === "encode") {
    return Array.from(input).map(c => 
      c.charCodeAt(0).toString()
    ).join(' ')
  } else {
    return input.split(' ').map(num =>
      String.fromCharCode(parseInt(num, 10))
    ).join('')
  }
}

export const getAlgorithmIcon = (algorithm: string) => {
  switch(algorithm) {
    case "md5":
    case "sha1":
    case "sha256":
      return "Hash"
    case "base64":
    case "url":
    case "html":
      return "LockKeyhole"
    case "binary":
      return "Binary"
    default:
      return "Code" // Using Code as a fallback instead of Braille
  }
}