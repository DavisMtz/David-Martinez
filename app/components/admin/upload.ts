export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
}

/** Upload a file straight from the browser to Cloudinary using a server-issued signature. */
export async function uploadToCloudinary(
  file: File,
  opts: { folder?: string; onProgress?: (pct: number) => void } = {},
): Promise<UploadResult> {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: opts.folder }),
  });
  if (!signRes.ok) throw new Error("No se pudo firmar la subida");
  const signed = (await signRes.json()) as {
    signature: string;
    timestamp: number;
    api_key: string;
    upload_url: string;
    params: Record<string, string>;
  };

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", signed.api_key);
  fd.append("timestamp", String(signed.timestamp));
  fd.append("signature", signed.signature);
  for (const [k, v] of Object.entries(signed.params)) {
    if (k !== "timestamp") fd.append(k, v);
  }

  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", signed.upload_url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && opts.onProgress) opts.onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as UploadResult);
      } else {
        let msg = `Cloudinary respondió ${xhr.status}`;
        try {
          msg = (JSON.parse(xhr.responseText) as { error?: { message?: string } }).error?.message ?? msg;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir"));
    xhr.send(fd);
  });
}
