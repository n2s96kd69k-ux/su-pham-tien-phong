import {HTTPException} from 'hono/http-exception';
import type {DB} from './db';
type Action={type:'read'|'submit'}|{type:'save';question:string;choice:number;revision:number};
export function grade(items:{id:string;correct:number}[],answers:Record<string,number>){return items.filter(item=>answers[item.id]===item.correct).length}
export async function start(db:DB,exam:string,owner:string){
 const [row]=await db`INSERT INTO attempts(owner,exam_id,deadline) SELECT ${owner},id,clock_timestamp()+minutes*interval '1 minute' FROM exams WHERE id=${exam}
 ON CONFLICT(owner,exam_id) WHERE submitted_at IS NULL DO UPDATE SET owner=EXCLUDED.owner RETURNING id`;
 if(!row)throw new HTTPException(404);return row;
}
export function attempt(db:DB,id:string,owner:string,action:Action){
 return db.begin(async tx=>{
 const [row]=await tx`SELECT a.*,e.title FROM attempts a JOIN exams e ON e.id=a.exam_id WHERE a.id=${id} AND a.owner=${owner} FOR UPDATE OF a`;
 if(!row)throw new HTTPException(404);
 const items=await tx<{id:string;title:string;options:string[];correct:number;explanation:string}[]>`SELECT v.id,v.title,v.body->'options' AS options,(v.body->>'correct')::int AS correct,v.body->>'explanation' AS explanation FROM exam_items i JOIN content_versions v ON v.id=i.question_id WHERE i.exam_id=${row.exam_id} ORDER BY i.position`;
 const [{expired}]=await tx`SELECT clock_timestamp() >= ${row.deadline} AS expired`;
 if(!row.submitted_at&&(action.type==='submit'||expired)){
 const [result]=await tx`UPDATE attempts SET submitted_at=clock_timestamp(),score=${grade(items,row.answers)},total=${items.length} WHERE id=${id} RETURNING submitted_at,score,total`;Object.assign(row,result);
 }else if(action.type==='save'){
 if(row.submitted_at||row.revision!==action.revision)throw new HTTPException(409);
 const item=items.find(i=>i.id===action.question);
 if(!item||action.choice<0||action.choice>=item.options.length)throw new HTTPException(400);
 row.answers[action.question]=action.choice;row.revision++;
 await tx`UPDATE attempts SET answers=${tx.json(row.answers)},revision=${row.revision} WHERE id=${id}`;
 }
 return {id:row.id,title:row.title,answers:row.answers,deadline:row.deadline,submitted_at:row.submitted_at,revision:row.revision,score:row.score,total:row.total,items:row.submitted_at?items:items.map(({id,title,options})=>({id,title,options}))};
 });
}
