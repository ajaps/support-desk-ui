// upload.js
import { DirectUpload } from "@rails/activestorage"
import { vi } from "vitest"

export function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const upload = new DirectUpload(
      file,
      (import.meta.env.VITE_BE_URL || 'http://localhost:3000') + '/rails/active_storage/direct_uploads'
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