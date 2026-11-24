import { jwtVerify, createRemoteJWKSet, importPKCS8, SignJWT } from "jose";

type Env = {
  FIREBASE_PROJECT_ID: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  UPLOAD_PATH_PREFIX: string;
  MAX_FILE_SIZE: string;
  ALLOWED_MIME: string;
  FIREBASE_SERVICE_ACCOUNT: string;
  GITHUB_TOKEN: string;
  ADMIN_UIDS?: string;
};

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

async function verifyFirebaseToken(idToken: string, projectId: string) {
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    algorithms: ["RS256"],
  });
  if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length > 128) {
    throw new Error("invalid subject");
  }
  return payload.sub as string;
}

async function getGoogleAccessToken(serviceAccountInput: string) {
  let raw = serviceAccountInput.trim();
  if (!raw.startsWith("{")) {
    try {
      raw = atob(raw);
    } catch {
      throw new Error("service account not valid base64 or json");
    }
  }
  let sa: { client_email?: string; private_key?: string };
  try {
    sa = JSON.parse(raw);
  } catch {
    throw new Error("service account json parse failed");
  }
  if (!sa.client_email || !sa.private_key) {
    throw new Error("service account missing required fields");
  }
  const now = Math.floor(Date.now() / 1000);
  const pk = await importPKCS8(sa.private_key, "RS256");
  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(pk);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("google_token_failed", res.status, body.slice(0, 200));
    throw new Error("google token failed");
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

async function isAdmin(uid: string, env: Env) {
  if (env.ADMIN_UIDS) {
    return env.ADMIN_UIDS.split(",").map((s) => s.trim()).includes(uid);
  }
  if (!env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("missing_firebase_service_account");
    return false;
  }
  try {
    const token = await getGoogleAccessToken(env.FIREBASE_SERVICE_ACCOUNT);
    const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/adminUsers/${uid}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const body = await res.text();
      console.error("firestore_admin_check_failed", res.status, body.slice(0, 200));
      return false;
    }
    const data = (await res.json()) as { fields?: { isActive?: { booleanValue?: boolean }; role?: { stringValue?: string } } };
    const isActive = data.fields?.isActive?.booleanValue === true;
    const role = data.fields?.role?.stringValue;
    return isActive && (role === "admin" || role === "editor");
  } catch (err) {
    console.error("admin_check_exception", err instanceof Error ? err.message : "unknown");
    return false;
  }
}

function sanitizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/-+/g, "-");
}

export default {
  async fetch(request: Request, env: Env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
    const url = new URL(request.url);
    if (url.pathname !== "/upload") return json({ error: "not found" }, 404);

    const authHeader = request.headers.get("Authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!idToken) return json({ error: "missing token" }, 401);

    let uid: string;
    try {
      uid = await verifyFirebaseToken(idToken, env.FIREBASE_PROJECT_ID);
    } catch {
      return json({ error: "invalid token" }, 401);
    }
    const allowed = await isAdmin(uid, env);
    if (!allowed) return json({ error: "forbidden", reason: "admin_check_failed" }, 403);

    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") return json({ error: "missing file" }, 400);
    const f = file as File;
    const max = parseInt(env.MAX_FILE_SIZE, 10) || 2097152;
    if (f.size > max) return json({ error: "file too large" }, 413);
    const allowedMime = env.ALLOWED_MIME.split(",").map((s) => s.trim());
    if (!allowedMime.includes(f.type)) return json({ error: "unsupported type" }, 415);

    const safeName = sanitizeName(f.name || "upload");
    const timestamp = Date.now();
    const path = `${env.UPLOAD_PATH_PREFIX}/${timestamp}-${safeName}`;

    const arrayBuffer = await f.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const content = btoa(binary);

    if (!env.GITHUB_TOKEN) {
      console.error("missing_github_token");
      return json({ error: "github auth failed", reason: "missing_token" }, 500);
    }

    const putRes = await fetch(
      `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "portfolio-upload-worker",
        },
        body: JSON.stringify({
          message: `chore: upload ${safeName} via admin`,
          content,
          branch: env.GITHUB_BRANCH,
        }),
      }
    );
    if (!putRes.ok) {
      const err = await putRes.text();
      console.error("github_upload_failed", putRes.status, err.slice(0, 200));
      return json({ error: "github upload failed", detail: err.slice(0, 300) }, 502);
    }
    const publicPath = `/assets/${timestamp}-${safeName}`;
    return json({ path: publicPath, fullPath: path });
  },
};
