import {createRemoteJWKSet,jwtVerify} from 'jose';
import type {Profile} from '../../../packages/contracts';
import type {DB} from './db';
export type Verify=(token:string)=>Promise<string>;
export function verifier(issuer:string):Verify{
 const keys=createRemoteJWKSet(new URL(issuer+'/.well-known/jwks.json'));
 return async token=>{const {payload}=await jwtVerify(token,keys,{issuer,audience:'authenticated',algorithms:['ES256','RS256'],requiredClaims:['exp','sub']});if(!payload.sub || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(payload.sub))throw Error('subject');return payload.sub}
}
export async function profile(db:DB,id:string):Promise<Profile>{
 await db`INSERT INTO profiles(id) VALUES (${id}) ON CONFLICT DO NOTHING`;
 const [user]=await db<Profile[]>`SELECT id,role FROM profiles WHERE id=${id}`;return user;
}
