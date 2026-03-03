// upload.js
import { DirectUpload } from "@rails/activestorage"

export function uploadFile(file, onProgress) {
  const delegate = onProgress
    ? {
        directUploadWillStoreFileWithXHR(xhr) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              onProgress(Math.round((event.loaded / event.total) * 100))
            }
          })
        },
      }
    : undefined

  return new Promise((resolve, reject) => {
    const upload = new DirectUpload(
      file,
      (import.meta.env.VITE_BE_URL || 'http://localhost:3000') + '/rails/active_storage/direct_uploads',
      delegate
    )

    upload.create((error, blob) => {
      if (error) {
        reject(error)
      } else {
        resolve(blob.signed_id)
      }
    })
  })
}