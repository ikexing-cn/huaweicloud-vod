import { readFileSync } from 'node:fs'
import {
  ConfirmAssetUploadReq,
  ConfirmAssetUploadReqStatusEnum,
  ConfirmAssetUploadRequest,
  CreateAssetByFileUploadReq,
  CreateAssetByFileUploadRequest,
  VodClient,
} from '@huaweicloud/huaweicloud-sdk-vod'
import { BasicCredentials, Region, } from '@huaweicloud/huaweicloud-sdk-core'
import { AK, ENDPOINT, PROJECT_ID, REGION, SK, UPLOAD_DIR, axios } from './shared'

const getVodClient = function () {
  const auth = new BasicCredentials()
    .withAk(AK)
    .withSk(SK)
    .withProjectId(PROJECT_ID)

  return VodClient.newBuilder()
    .withCredential(auth)
    .withRegion(new Region(REGION, ENDPOINT))
    .build()
}

const uploadVod = async function (file: Express.Multer.File) {
  const vodClient = getVodClient()

  const uploadReq = new CreateAssetByFileUploadReq()
  const uploadRequest = new CreateAssetByFileUploadRequest()

  uploadReq.withVideoType(file.mimetype.split('/')[1].toUpperCase())
    .withVideoName(file.originalname)
    .withTitle(file.originalname)
  uploadRequest.withBody(uploadReq)

  const tempObs = await vodClient.createAssetByFileUpload(uploadRequest)
  // @ts-expect-error
  const assetId = tempObs.asset_id
  // @ts-expect-error
  const videoUploadUrl = tempObs.video_upload_url

  const fileUrl = `${UPLOAD_DIR}${file.filename}`

  const fileBuffer = readFileSync(fileUrl)

  const { status } = await axios.put(videoUploadUrl!, fileBuffer, { headers: { 'Content-Type': file.mimetype } })

  if (status !== 200)
    throw new Error('上传视频失败')

  const confirmReq = new ConfirmAssetUploadReq()
  const confirmRequest = new ConfirmAssetUploadRequest()

  confirmReq.withStatus(ConfirmAssetUploadReqStatusEnum.CREATED)
    .withAssetId(assetId!)
  confirmRequest.withBody(confirmReq)
  const { httpStatusCode } = await vodClient.confirmAssetUpload(confirmRequest)
  return httpStatusCode === 200
}

export {
  uploadVod,
  getVodClient
}

