import { fileURLToPath } from 'node:url'
import axios from 'axios'

export { AK, ENDPOINT, PROJECT_ID, REGION, SK } from '../secret.json'

export const UPLOAD_DIR = fileURLToPath(new URL('../upload/', import.meta.url))
export const CUSTOM_AXIOS = axios.create({
  maxBodyLength: Infinity // 设置axios最大的大小
})
