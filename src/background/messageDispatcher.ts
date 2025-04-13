import { saveSettings } from '../utils/storage';

type Message = {
    type: string;
    payload?: any;
};

type Handler = (payload: any) => Promise<any>;

let lastResolution: { width: number; height: number } | null = null;
let lastQuality: string | null = null;

const handlers: Record<string, Handler> = {
    RESOLUTION_DETECTED: async (payload) => {
        console.log(`Resolution detected: ${payload.width}x${payload.height}`);
        lastResolution = { width: payload.width, height: payload.height };
        return { success: true };
    },

    GET_RESOLUTION: async () => {
        return { error: 'GET_RESOLUTION debe hacerse desde un content script o popup.' };
    },

    GET_LAST_RESOLUTION: async () => {
        if (lastResolution) {
            return lastResolution;
        }
        return { error: 'No hay resolución almacenada.' };
    },

    SAVE_SETTINGS: async (payload) => {
        await saveSettings(payload);
        console.log('Settings updated');
        return { success: true };
    },

    QUALITY_CHANGED: async (payload) => {
        console.log(`Calidad de video cambiada a: ${payload.quality}`);
        lastQuality = payload.quality;
        return { success: true };
    },

    GET_LAST_QUALITY: async () => {
        if (lastQuality) {
            return { quality: lastQuality };
        }
        return { error: 'No hay calidad almacenada.' };
    },
};

export async function handleMessage(message: Message): Promise<any> {
    const handler = handlers[message.type];
    if (!handler) {
        console.warn('Unknown message type:', message.type);
        return { success: false, error: `Unknown message type: ${message.type}` };
    }

    return await handler(message.payload);
}