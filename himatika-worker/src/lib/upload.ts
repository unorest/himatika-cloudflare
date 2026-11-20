// src/lib/upload.ts
// Helper upload file ke Cloudflare R2

export type UploadResult = {
  key: string
  url: string
  size: number
  contentType: string
}

export type UploadFolder = 'avatars' | 'posts' | 'galleries' | 'attachments'

const ALLOWED_MIME: Record<UploadFolder, string[]> = {
  avatars:     ['image/jpeg', 'image/png', 'image/webp'],
  posts:       ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  galleries:   ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  attachments: ['application/pdf', 'image/jpeg', 'image/png'],
}

const MAX_SIZE: Record<UploadFolder, number> = {
  avatars:     2 * 1024 * 1024,   // 2 MB
  posts:       5 * 1024 * 1024,   // 5 MB
  galleries:   10 * 1024 * 1024,  // 10 MB
  attachments: 20 * 1024 * 1024,  // 20 MB
}

export async function uploadFile(
  bucket: R2Bucket,
  file: File,
  folder: UploadFolder
): Promise<{ success: true; result: UploadResult } | { success: false; error: string }> {
  // Validasi tipe file
  if (!ALLOWED_MIME[folder].includes(file.type)) {
    return { success: false, error: `Tipe file tidak diizinkan: ${file.type}` }
  }

  // Validasi ukuran
  if (file.size > MAX_SIZE[folder]) {
    const max = MAX_SIZE[folder] / 1024 / 1024
    return { success: false, error: `Ukuran file melebihi batas ${max} MB` }
  }

  // Buat nama file unik
  const ext = file.name.split('.').pop() ?? 'bin'
  const uid = crypto.randomUUID()
  const key = `${folder}/${uid}.${ext}`

  // Upload ke R2
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name },
  })

  return {
    success: true,
    result: {
      key,
      url: `/uploads/${key}`, // akan diproxy dari Worker
      size: file.size,
      contentType: file.type,
    },
  }
}

export async function deleteFile(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key)
}

// Serve file dari R2 (dipanggil dari route GET /uploads/*)
export async function serveFile(
  bucket: R2Bucket,
  key: string
): Promise<Response> {
  const object = await bucket.get(key)
  if (!object) {
    return new Response('File tidak ditemukan', { status: 404 })
  }
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
