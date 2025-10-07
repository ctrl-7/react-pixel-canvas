import type { GridState } from '@/components/PixelGrid'

class SerializerDeserializer {
  getJSONFromGridState(gridState: GridState): string {
    const jsonData = {
      present: gridState.present,
      past: gridState.past,
      future: gridState.future,
    }

    return JSON.stringify(jsonData, null, 2)
  }
}

export const serializerDeserializer = new SerializerDeserializer()
