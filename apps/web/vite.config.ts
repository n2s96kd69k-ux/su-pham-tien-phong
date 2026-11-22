import { defineConfig,loadEnv } from 'vite';
import { resolve } from 'node:path';
export default defineConfig(({mode})=>{const env=loadEnv(mode,process.cwd(),'');return {root:'apps/web',envDir:process.cwd(),base:'./',server:{proxy:{'/api':env.DEV_API_TARGET||'http://127.0.0.1:8787'}},build:{outDir:resolve('dist/web'),emptyOutDir:true}}});
