import { Readable } from "node:stream";
import { db } from "./db.js";
import { oauthClient, decryptTokens } from "./auth.js";
import { encrypt } from "./crypto.js";

const DRIVE = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";

export async function getAccessToken(user) {
  const { accessToken, refreshToken } = decryptTokens(user);
  if (!refreshToken && !accessToken) {
    const err = new Error("This account has no Google Drive access. Re-authorize.");
    err.code = "DRIVE_NO_TOKEN";
    throw err;
  }

  // If token_expiry exists and is still valid (with 5 min buffer), use existing token
  if (accessToken && user.token_expiry && Number(user.token_expiry) > Date.now() + 5 * 60 * 1000) {
    return accessToken;
  }

  // Need to refresh
  if (!refreshToken) {
    // No refresh token and access token is expired/missing
    if (accessToken) return accessToken; // try it anyway
    const err = new Error("This account has no Google Drive access. Re-authorize.");
    err.code = "DRIVE_NO_TOKEN";
    throw err;
  }

  try {
    const client = oauthClient();
    client.setCredentials({
      refresh_token: refreshToken,
    });
    const { credentials } = await client.refreshAccessToken();
    const newAccessToken = credentials.access_token;
    const newExpiry = credentials.expiry_date || (Date.now() + 3600 * 1000);

    // Save the refreshed token back to the database
    await db.run(
      "UPDATE users SET access_token = ?, token_expiry = ? WHERE google_id = ?",
      [encrypt(newAccessToken), newExpiry, user.google_id]
    );

    return newAccessToken;
  } catch (refreshErr) {
    console.error("[drive] Token refresh failed:", refreshErr?.message);
    // If refresh fails but we have an access token, try it anyway
    if (accessToken) return accessToken;
    const err = new Error("The host's Google Drive access expired. Ask the host to sign in again.");
    err.code = "DRIVE_NO_TOKEN";
    throw err;
  }
}

async function driveJson(token, url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    let body = "";
    try {
      body = await res.text();
    } catch {}
    const err = new Error(`Drive API ${res.status}: ${body}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

export async function ensureRootFolder(user) {
  if (user.root_folder_id) {
    return user.root_folder_id;
  }
  const token = await getAccessToken(user);
  const q = encodeURIComponent(
    `name='G_Cloister' and 'root' in parents and trashed=false and appProperties has { key='gcRoot' and value='1' }`
  );
  const list = await driveJson(
    token,
    `${DRIVE}/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=1`
  );
  if (list.files?.length) {
    const id = list.files[0].id;
    await db.run("UPDATE users SET root_folder_id = ? WHERE google_id = ?", [
      id,
      user.google_id,
    ]);
    return id;
  }
  const created = await driveJson(
    token,
    `${DRIVE}/files`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "G_Cloister",
        mimeType: "application/vnd.google-apps.folder",
        appProperties: { gcRoot: "1" },
      }),
    }
  );
  await db.run("UPDATE users SET root_folder_id = ? WHERE google_id = ?", [
    created.id,
    user.google_id,
  ]);
  return created.id;
}

export async function ensureRoomFolder(user, roomId) {
  const rootId = await ensureRootFolder(user);
  const token = await getAccessToken(user);
  const q = encodeURIComponent(
    `name='${roomId}' and '${rootId}' in parents and trashed=false and appProperties has { key='gcRoom' and value='${roomId}' }`
  );
  const list = await driveJson(
    token,
    `${DRIVE}/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=1`
  );
  if (list.files?.length) return list.files[0].id;
  const created = await driveJson(
    token,
    `${DRIVE}/files`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: roomId,
        mimeType: "application/vnd.google-apps.folder",
        parents: [rootId],
        appProperties: { gcRoom: roomId },
      }),
    }
  );
  return created.id;
}

export async function createResumableSession(token, folderId, name, mimeType) {
  const res = await fetch(`${UPLOAD}?uploadType=resumable`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Upload-Content-Type": mimeType || "application/octet-stream",
    },
    body: JSON.stringify({
      name,
      parents: [folderId],
      appProperties: { gcUpload: "1" },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Drive session ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  const location = res.headers.get("location");
  if (!location) throw new Error("Drive returned no upload URI");
  return location;
}

export async function uploadStream(token, uploadUri, stream, size) {
  const res = await fetch(uploadUri, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
    },
    body: stream,
    duplex: "half",
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Drive upload ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function getDriveFile(fileId, token) {
  return driveJson(
    token,
    `${DRIVE}/files/${fileId}?fields=id,name,mimeType,size,createdTime,webViewLink,thumbnailLink,iconLink`
  );
}

export async function deleteDriveFile(token, fileId) {
  const res = await fetch(`${DRIVE}/files/${fileId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status >= 400 && res.status !== 404) {
    const body = await res.text();
    const err = new Error(`Drive delete ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
}

export async function downloadDriveStream(token, fileId) {
  const res = await fetch(`${DRIVE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Drive download ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  const nodeStream = Readable.fromWeb(res.body);
  return {
    stream: nodeStream,
    contentType: res.headers.get("content-type"),
    contentLength: res.headers.get("content-length"),
    filename: extractFilename(res.headers.get("content-disposition")),
  };
}

export async function ensureViewPermission(fileId, token) {
  const data = await driveJson(
    token,
    `${DRIVE}/files/${fileId}/permissions?fields=permissions(id,role,type,emailAddress)&supportsAllDrives=true`
  );
  let existing = data.permissions?.find(
    (p) => p.role === "reader" && p.type === "anyone"
  );
  if (!existing) {
    const created = await driveJson(
      token,
      `${DRIVE}/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      }
    );
    existing = created;
  }
  const meta = await driveJson(
    token,
    `${DRIVE}/files/${fileId}?fields=webViewLink,webContentLink,thumbnailLink,name`
  );
  return {
    permissionId: existing.id,
    webViewLink: meta.webViewLink,
    webContentLink: meta.webContentLink,
    thumbnailLink: meta.thumbnailLink,
    name: meta.name,
  };
}

export async function revokeViewPermission(fileId, permissionId, token) {
  if (!permissionId) return;
  await fetch(`${DRIVE}/files/${fileId}/permissions/${permissionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

function extractFilename(header) {
  if (!header) return null;
  const match = /filename="?([^";]+)"?/.exec(header);
  return match ? match[1] : null;
}

export const rootFolderName = "G_Cloister";

export async function uploadBufferMultipart(token, folderId, name, mimeType, buffer) {
  const boundary = "-------314159265358979323846";
  const delimiter = "\r\n--" + boundary + "\r\n";
  const closeDelim = "\r\n--" + boundary + "--";

  const metadata = {
    name,
    parents: [folderId],
    mimeType: mimeType || "application/octet-stream",
  };

  const multipartResponseBody = Buffer.concat([
    Buffer.from(delimiter + "Content-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(metadata)),
    Buffer.from("\r\n--" + boundary + "\r\n" + "Content-Type: " + (mimeType || "application/octet-stream") + "\r\n\r\n"),
    buffer,
    Buffer.from(closeDelim),
  ]);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": String(multipartResponseBody.length),
    },
    body: multipartResponseBody,
  });

  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Drive multipart upload ${res.status}: ${body}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function syncFileToUserDrive(hostUser, participantUser, roomId, driveFileId, fileName, mimeType, sizeBytes) {
  try {
    console.log(`[sync] Syncing "${fileName}" to participant ${participantUser.google_id || participantUser.email}...`);
    const hostToken = await getAccessToken(hostUser);
    const participantToken = await getAccessToken(participantUser);

    const targetFolderId = await ensureRoomFolder(participantUser, roomId);

    const safeName = fileName.replace(/'/g, "\\'");
    const q = encodeURIComponent(
      `name='${safeName}' and '${targetFolderId}' in parents and trashed=false`
    );
    const existing = await driveJson(
      participantToken,
      `${DRIVE}/files?q=${q}&spaces=drive&fields=files(id)&pageSize=1`
    );
    if (existing.files?.length) {
      console.log(`[sync] "${fileName}" already exists in participant Drive (${existing.files[0].id})`);
      return existing.files[0].id;
    }

    // Method 1: Drive API native copy (Instant & Server-side)
    try {
      await ensureViewPermission(driveFileId, hostToken);
      const copied = await driveJson(
        participantToken,
        `${DRIVE}/files/${driveFileId}/copy?supportsAllDrives=true`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fileName,
            parents: [targetFolderId],
          }),
        }
      );
      console.log(`[sync] Native Drive copy successful for "${fileName}": ${copied.id}`);
      return copied.id;
    } catch (copyErr) {
      console.warn(`[sync] Native Drive copy failed (${copyErr.message}), falling back to multipart buffer upload...`);
    }

    // Method 2: Download buffer from host, upload multipart buffer to participant
    const streamRes = await downloadDriveStream(hostToken, driveFileId);
    const arrayBuf = await streamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const uploaded = await uploadBufferMultipart(
      participantToken,
      targetFolderId,
      fileName,
      mimeType,
      buffer
    );

    console.log(`[sync] Multipart upload successful for "${fileName}": ${uploaded.id}`);
    return uploaded.id;
  } catch (err) {
    console.error(`[drive] syncFileToUserDrive failed for ${participantUser.google_id}:`, err?.message || err);
    return null;
  }
}

export async function syncRoomFilesToParticipant(roomId, participantUser) {
  console.log(`[sync] Starting room sync for room ${roomId} to user ${participantUser.google_id}...`);
  const room = await db.get("SELECT * FROM rooms WHERE room_id = ?", [roomId]);
  if (!room) return 0;
  const hostUser = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
  if (!hostUser) return 0;

  const files = await db.all("SELECT * FROM files WHERE room_id = ?", [roomId]);
  console.log(`[sync] Found ${files.length} files to sync for room ${roomId}`);
  let count = 0;
  for (const file of files) {
    const res = await syncFileToUserDrive(
      hostUser,
      participantUser,
      roomId,
      file.drive_file_id,
      file.name,
      file.mime_type,
      file.size_bytes
    );
    if (res) count++;
  }
  return count;
}

export async function deleteSyncedFileFromAllMembers(roomId, fileName) {
  try {
    const members = await db.all(
      `SELECT u.* FROM room_members rm
       JOIN users u ON u.google_id = rm.user_id
       WHERE rm.room_id = ?`,
      [roomId]
    );

    for (const member of members) {
      try {
        const token = await getAccessToken(member);
        const rootId = await ensureRootFolder(member);
        const qFolder = encodeURIComponent(
          `name='${roomId}' and '${rootId}' in parents and trashed=false`
        );
        const folderList = await driveJson(
          token,
          `${DRIVE}/files?q=${qFolder}&spaces=drive&fields=files(id)&pageSize=1`
        );
        if (!folderList.files?.length) continue;
        const folderId = folderList.files[0].id;

        const safeName = fileName.replace(/'/g, "\\'");
        const qFile = encodeURIComponent(
          `name='${safeName}' and '${folderId}' in parents and trashed=false`
        );
        const fileList = await driveJson(
          token,
          `${DRIVE}/files?q=${qFile}&spaces=drive&fields=files(id)&pageSize=10`
        );
        if (fileList.files?.length) {
          for (const f of fileList.files) {
            await deleteDriveFile(token, f.id).catch(() => {});
          }
        }
      } catch (memErr) {
        console.error(`[drive] deleteSyncedFileFromAllMembers error for user ${member.google_id}:`, memErr?.message || memErr);
      }
    }
  } catch (err) {
    console.error("[drive] deleteSyncedFileFromAllMembers failed:", err?.message || err);
  }
}
