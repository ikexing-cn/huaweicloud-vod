import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import _axios from 'axios'

export const UPLOAD_DIR = fileURLToPath(new URL('../upload/', import.meta.url))
export const axios = _axios.create({
  maxBodyLength: Infinity // 设置axios最大的大小
})

const { AK, ENDPOINT, PROJECT_ID, REGION, SK } = process.argv[3] === 'dev'
  ? JSON.parse(readFileSync(new URL('../config/secret_dev.json', import.meta.url), 'utf-8'))
  : JSON.parse(readFileSync(new URL('../config/secret.json', import.meta.url), 'utf-8'))

export { AK, ENDPOINT, PROJECT_ID, REGION, SK }
