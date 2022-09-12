import { info } from 'console'
import { unlinkSync } from 'node:fs'
import { url } from 'inspector'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { getVideoUrl, removeVideo, uploadVideo } from './huaweicloud'
import { REGION, UPLOAD_DIR } from './shared'

const app = express()
const upload = multer({ dest: 'upload/' })

app.use(cors())
app.use(express.json())

app.post('/upload', upload.single('video'), async (req, res) => {
  const file = req.file as Express.Multer.File
  let assetId: string
  try {
    assetId = await uploadVideo(file).finally(() => {
      // 无论上传是否成功都删除本地文件
      const fileUrl = `${UPLOAD_DIR}${file.filename}`
      unlinkSync(fileUrl)
    })
  }
  catch (error) {
    res.status(403).send({ scuess: false })
    throw error
  }

  res.status(200).send({ scuess: true, assetId })
})

app.get('/remove', async (req, res) => {
  const id = req.query?.id as string
  if (!id) {
    res.status(403).send({ scuess: false, msg: 'ID不存在' })
    return
  }
  const idList: Array<string> = !!id && id?.includes(',') ? id.split(',') : [id]
  const videos = await removeVideo(idList)
  if (videos && videos?.length <= 0)
    res.status(200).send({ scuess: true })
  else
    res.status(403).send({ scuess: false, videos })
})

app.get('/play_url', async (req, res) => {
  const id = req.query?.id as string
  if (!id) {
    res.status(403).send({ scuess: false, msg: 'ID不存在' })
    return
  }

  const urlList = await getVideoUrl(id)
  if (url && url.length >= 0)
    res.status(200).send({ success: true, urlList })
  else
    res.status(403).send({ scuess: false })
})

app.listen(3000, () => {
  info('Server started on port 3000, http://localhost:3000')
})
