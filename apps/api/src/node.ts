import {serve} from '@hono/node-server';
import {createApp} from './app';
import {connect} from './db';
import {services} from './config';
const db=process.env.DATABASE_URL?connect(process.env.DATABASE_URL):undefined;
const app=createApp({...services(process.env),db});
const server=serve({fetch:app.fetch,port:Number(process.env.PORT||8787)});
process.once('SIGTERM',()=>server.close(()=>void db?.end()));
