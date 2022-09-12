import { info } from 'console'
import { unlinkSync } from 'node:fs'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { uploadVod } from './huaweicloud'
import { UPLOAD_DIR } from './shared'

const app = express()
const upload = multer({ dest: 'upload/' })

app.use(cors())
app.use(express.json())

app.post('/upload', upload.single('video'), async (req, res) => {
  const file = req.file as Express.Multer.File
  try {
    await uploadVod(file).finally(() => {
      // 无论上传是否成功都删除本地文件
      const fileUrl = `${UPLOAD_DIR}${file.filename}`
      unlinkSync(fileUrl)
    })
  }
  catch (error) {
    res.status(301).send({ scuess: false })
    throw error
  }

  res.status(200).send({ scuess: true })
})

app.listen(3000, () => {
  info('Server started on port 3000, http://localhost:3000')
})
