import { saveSettings } from '../utils/storage'

type Message = {
  type: string
  payload?: any
}

type Handler = (payload: any) => Promise<any>

const handlers: Record<string, Handler> = {
  'RESOLUTION_DETECTED': async (payload) => {
    console.log(`Resolution detected: ${payload.width}x${payload.height}`)
    return { success: true }
  },

  'GET_RESOLUTION': async () => {
    // No disponible desde background. Devuelve error.
    return { error: 'GET_RESOLUTION debe hacerse desde un content script o popup.' }
  },

  'SAVE_SETTINGS': async (payload) => {
    await saveSettings(payload)
    console.log('Settings updated')
    return { success: true }
  },
}

export async function handleMessage(message: Message): Promise<any> {
  const handler = handlers[message.type]
  if (!handler) {
    console.warn('Unknown message type:', message.type)
    return { success: false, error: `Unknown message type: ${message.type}` }
  }

  return await handler(message.payload)
}