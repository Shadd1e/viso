export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

export function json(
  data: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
}

const url =
  Deno.env.get("SUPABASE_URL");

const key =
  Deno.env.get(
    "VISO_SUPABASE_SERVICE_ROLE_KEY",
  );

if (!url) {
  console.warn(
    "SUPABASE_URL is not configured.",
  );
}

if (!key) {
  console.warn(
    "VISO_SUPABASE_SERVICE_ROLE_KEY is not configured.",
  );
}

export async function sb(
  path: string,
  init: RequestInit = {},
) {
  if (!url || !key) {
    throw new Error(
      "Supabase server environment variables are not configured.",
    );
  }

  const response = await fetch(
    `${url}/rest/v1/${path}`,
    {
      ...init,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type":
          "application/json",
        ...(init.headers || {}),
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await response.text(),
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}