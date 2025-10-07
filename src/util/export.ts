import type { GridState } from '@/components/PixelGrid'
import { toPng, toSvg } from 'html-to-image'
import { serializerDeserializer } from './serializer'

export type ExportTypes = 'png' | 'svg' | 'json';
export type ExportData = GridState | HTMLElement

export interface ExportOption {
  format: ExportTypes
  label: string
  converter: (data: ExportData) => Promise<string>
}

// Type guard to check if data is GridState
function isGridState(data: ExportData): data is GridState {
  return typeof data === 'object' && 'past' in data && 'present' in data && 'future' in data
}

// Type guard to check if data is HTMLElement
function isHTMLElement(data: ExportData): data is HTMLElement {
  return data instanceof HTMLElement
}

function toJSON(data: ExportData): Promise<string> {
  if (!isGridState(data)) {
    return Promise.reject(new Error('JSON export requires GridState data'))
  }
  const jsonString = serializerDeserializer.getJSONFromGridState(data)
  const blob = new Blob([jsonString], { type: 'application/json' })
  return Promise.resolve(URL.createObjectURL(blob))
}

function toPngWrapper(data: ExportData): Promise<string> {
  if (!isHTMLElement(data)) {
    return Promise.reject(new Error('PNG export requires HTMLElement data'))
  }
  return toPng(data)
}

function toSvgWrapper(data: ExportData): Promise<string> {
  if (!isHTMLElement(data)) {
    return Promise.reject(new Error('SVG export requires HTMLElement data'))
  }
  return toSvg(data)
}

export const exportOptions: ExportOption[] = [
  {
    converter: toPngWrapper,
    format: 'png',
    label: 'PNG Image',
  },
  {
    converter: toSvgWrapper,
    format: 'svg',
    label: 'SVG Vector',
  },
  {
    converter: toJSON,
    format: 'json',
    label: 'JSON',
  },
]