import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import {sql as query} from 'drizzle-orm';
export type DB=ReturnType<typeof postgres>;
export const connect=(url:string,max=5)=>postgres(url,{prepare:false,max,connect_timeout:6,idle_timeout:10});
export function catalog(db:DB){return drizzle(db).execute(query`SELECT DISTINCT ON (v.series) v.id,v.title,v.version,c.subject,c.title AS course FROM content_versions v JOIN courses c ON c.id=v.course_id WHERE v.state='published' AND v.kind='lesson' ORDER BY v.series,v.version DESC`)}

