import path from 'node:path';
import { defineConfig, loadEnv, type UserConfig } from 'vite';

export default defineConfig(({ mode }): UserConfig => {

    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: `${env.VITE_BASE_URL}` || '/games/hati/',
        server: {
            port: Number(env.VITE_PORT) || 8003
        }
    }
});