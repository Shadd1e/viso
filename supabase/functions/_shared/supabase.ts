export const corsHeaders={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
export function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'Content-Type':'application/json'}})}
const url=Deno.env.get('SUPABASE_URL')!; const key=Deno.env.get('VISO_SUPABASE_SERVICE_ROLE_KEY')!;
export async function sb(path:string, init:RequestInit={}){const r=await fetch(`${url}/rest/v1/${path}`,{...init,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(init.headers||{})}});if(!r.ok)throw new Error(await r.text());return r.status===204?null:r.json()}
