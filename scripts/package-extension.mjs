/**
 * Empaqueta extension/ en frontend/public/safelink-extension.zip
 * para que Vercel/Vite sirvan un ZIP real y no el index.html del SPA.
 */
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const EXT = path.join(ROOT, 'extension')
const OUT_DIR = path.join(ROOT, 'frontend', 'public')
const OUT = path.join(OUT_DIR, 'safelink-extension.zip')
const SKIP = new Set(['.ds_store', 'thumbs.db'])

function crc32(buf) {
  if (typeof zlib.crc32 === 'function') return zlib.crc32(buf) >>> 0
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}

function u16(n) {
  const b = Buffer.alloc(2)
  b.writeUInt16LE(n)
  return b
}

function u32(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32LE(n)
  return b
}

function walk(dir, prefix = '') {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name.toLowerCase())) continue
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(abs, rel))
    else if (entry.isFile()) files.push({ abs, rel })
  }
  return files
}

function buildZip(files) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const { abs, rel } of files) {
    const data = fs.readFileSync(abs)
    const name = Buffer.from(rel.replaceAll('\\', '/'), 'utf8')
    const crc = crc32(data)
    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      name,
      data,
    ])
    const central = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }
  const centralDir = Buffer.concat(centrals)
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ])
  return Buffer.concat([...locals, centralDir, eocd])
}

if (!fs.existsSync(path.join(EXT, 'manifest.json'))) {
  console.error('No se encontró extension/manifest.json')
  process.exit(1)
}

const files = walk(EXT).sort((a, b) => a.rel.localeCompare(b.rel))
if (!files.some((f) => f.rel === 'manifest.json')) {
  console.error('El ZIP debe incluir manifest.json en la raíz')
  process.exit(1)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(OUT, buildZip(files))
console.log(`Generado ${path.relative(ROOT, OUT)} (${files.length} archivos)`)
