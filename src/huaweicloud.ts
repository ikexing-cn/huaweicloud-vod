import { readFileSync } from 'node:fs'
import {
  ConfirmAssetUploadReq,
  ConfirmAssetUploadReqStatusEnum,
  ConfirmAssetUploadRequest,
  CreateAssetByFileUploadReq,
  CreateAssetByFileUploadRequest,
  DeleteAssetsRequest,
  DeleteResultStatusEnum,
  ShowAssetDetailRequest,
  VodClient
} from '@huaweicloud/huaweicloud-sdk-vod'
import type { MetaData } from '@huaweicloud/huaweicloud-sdk-vod'
import { BasicCredentials, Region } from '@huaweicloud/huaweicloud-sdk-core'
import { AK, ENDPOINT, PROJECT_ID, REGION, SK, UPLOAD_DIR, axios } from './shared'

// API: https://apiexplorer.developer.huaweicloud.com/apiexplorer/sdk

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

const uploadVideo = async function (file: Express.Multer.File) {
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

  const fileBuffer = readFileSync(`${UPLOAD_DIR}${file.filename}`)

  const { status } = await axios.put(videoUploadUrl!, fileBuffer, { headers: { 'Content-Type': file.mimetype } })

  if (status !== 200)
    throw new Error('上传视频失败')

  const confirmReq = new ConfirmAssetUploadReq()
  const confirmRequest = new ConfirmAssetUploadRequest()

  confirmReq.withStatus(ConfirmAssetUploadReqStatusEnum.CREATED)
    .withAssetId(assetId!)
  confirmRequest.withBody(confirmReq)
  await vodClient.confirmAssetUpload(confirmRequest)
  return assetId
}

const removeVideo = async function (assetId: Array<string>) {
  const vodClient = getVodClient()

  const assetsRequest = new DeleteAssetsRequest()
  assetsRequest.withAssetId(assetId)

  const results = await vodClient.deleteAssets(assetsRequest)
  // @ts-expect-error
  const toReturn = results.delete_result_array?.filter(item => item.status !== DeleteResultStatusEnum.DELETED)
  return toReturn
}

const getVideoUrl = async function (assetId: string) {
  const vodClient = getVodClient()

  const detailRequest = new ShowAssetDetailRequest()
  detailRequest.withAssetId(assetId)
  const detail = await vodClient.showAssetDetail(detailRequest)
  // @ts-expect-error
  const outputs = (detail.transcode_info as TranscodeInfo)?.output
  if (!outputs || outputs.length <= 0)
    return ['']

  const urlList: Array<string> = []
  for (const output of outputs) {
    // @ts-expect-error
    const { bit_rate, duration, video_size } = output.meta_data as MetaData
    bit_rate > 0 && duration && duration > 0 && video_size > 0 && urlList.push(output.url)
  }

  return urlList
}

export {
  uploadVideo,
  removeVideo,
  getVideoUrl,
  getVodClient,
}

