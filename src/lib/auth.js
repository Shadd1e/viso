const U=import.meta.env.VITE_SUPABASE_URL,A=import.meta.env.VITE_SUPABASE_ANON_KEY,K='viso:customer-session';
const H=t=>({apikey:A,Authorization:`Bearer ${t||A}`,'Content-Type':'application/json'});
export const getStoredSession=()=>{try{return JSON.parse(localStorage.getItem(K)||'null')}catch{return null}};
const save=s=>{s?localStorage.setItem(K,JSON.stringify(s)):localStorage.removeItem(K);window.dispatchEvent(new Event('viso-auth-change'));return s};
export async function signIn(email,password){const r=await fetch(`${U}/auth/v1/token?grant_type=password`,{method:'POST',headers:H(),body:JSON.stringify({email,password})}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error_description||d.msg||'Unable to sign in.');return save(d)}
export async function signUp({email,password,fullName,phone}){const r=await fetch(`${U}/auth/v1/signup`,{method:'POST',headers:H(),body:JSON.stringify({email,password,data:{full_name:fullName,phone}})}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.msg||d.error_description||'Unable to create account.');if(d.access_token)save(d);return d}
export async function getUser(){const s=getStoredSession();if(!s?.access_token)return null;const r=await fetch(`${U}/auth/v1/user`,{headers:H(s.access_token)});if(!r.ok){save(null);return null}return r.json()}
export async function signOut(){save(null)};export const authToken=()=>getStoredSession()?.access_token||null;
