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

export async function syncFileToUserDrive(hostUser, participantUser, roomId, driveFileId, fileName, mimeType, sizeBytes) {
  try {
    const hostToken = await getAccessToken(hostUser);
    const participantToken = await getAccessToken(participantUser);

    const targetFolderId = await ensureRoomFolder(participantUser, roomId);

    const q = encodeURIComponent(
      `name='${fileName.replace(/'/g, "\\'")}' and '${targetFolderId}' in parents and trashed=false`
    );
    const existing = await driveJson(
      participantToken,
      `${DRIVE}/files?q=${q}&spaces=drive&fields=files(id)&pageSize=1`
    );
    if (existing.files?.length) {
      return existing.files[0].id;
    }

    const streamRes = await downloadDriveStream(hostToken, driveFileId);
    const uploadUri = await createResumableSession(
      participantToken,
      targetFolderId,
      fileName,
      mimeType
    );

    const uploaded = await uploadStream(participantToken, uploadUri, streamRes.body, sizeBytes);
    return uploaded.id;
  } catch (err) {
    console.error(`[drive] syncFileToUserDrive failed for ${participantUser.google_id}:`, err?.message || err);
    return null;
  }
}

export async function syncRoomFilesToParticipant(roomId, participantUser) {
  const room = await db.get("SELECT * FROM rooms WHERE room_id = ?", [roomId]);
  if (!room) return;
  const hostUser = await db.get("SELECT * FROM users WHERE google_id = ?", [room.host_user_id]);
  if (!hostUser) return;

  const files = await db.all("SELECT * FROM files WHERE room_id = ?", [roomId]);
  for (const file of files) {
    await syncFileToUserDrive(
      hostUser,
      participantUser,
      roomId,
      file.drive_file_id,
      file.name,
      file.mime_type,
      file.size_bytes
    );
  }
}
