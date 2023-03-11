import admin from "firebase-admin"

export const getTextFile = async (filename: string) => {
  const bucket = admin.storage().bucket()
  const file = bucket.file(filename)
  const resp = await file.download()

  return resp[0].toString()
}

export const uploadTextFile = async (
  filename: string,
  fileContents: string
) => {
  const bucket = admin.storage().bucket()
  const metadata = {
    contentType: "txt",
    cacheControl: "public, max-age=31536000",
  }

  const file = bucket.file(filename)
  await file.save(fileContents, {
    resumable: false,
    metadata: metadata,
    validation: false,
  })

  return filename
}
