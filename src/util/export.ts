import { toPng, toSvg } from 'html-to-image'

export type ExportTypes = 'png' | 'svg'

export const exportOptions = [
  {
    converter: toPng,
    format: 'png',
    label: 'PNG Image',
  },
  {
    converter: toSvg,
    format: 'svg',
    label: 'SVG Vector',
  },
]
