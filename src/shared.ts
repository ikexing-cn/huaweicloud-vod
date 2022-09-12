import { fileURLToPath } from 'node:url'
import _axios from 'axios'

export { AK, ENDPOINT, PROJECT_ID, REGION, SK } from '../secret.json'

export const UPLOAD_DIR = fileURLToPath(new URL('../upload/', import.meta.url))
export const axios = _axios.create({
  maxBodyLength: Infinity // 设置axios最大的大小
})
