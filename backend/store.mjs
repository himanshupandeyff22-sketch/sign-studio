import { DatabaseSync } from 'node:sqlite';
import { createHash,randomBytes } from 'node:crypto';
export function createStore(filename) {
  const db=new DatabaseSync(filename);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, language TEXT NOT NULL DEFAULT 'en', speed REAL NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS translations (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL REFERENCES sessions(id), created_at TEXT NOT NULL, payload TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS translations_session ON translations(session_id,id DESC);`);
  const hash=token=>createHash('sha256').update(token).digest('hex');
  function getSession(token){if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT language,speed,created_at FROM sessions WHERE id=?').get(hash(token));}
  return {
    getSession,
    createSession(){const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions(id,created_at) VALUES (?,?)').run(hash(token),new Date().toISOString());return {token,session:getSession(token)};},
    updateSession(token,language,speed){db.prepare('UPDATE sessions SET language=?,speed=? WHERE id=?').run(language,speed,hash(token));return getSession(token);},
    save(token,payload){const createdAt=new Date().toISOString();const result=db.prepare('INSERT INTO translations(session_id,created_at,payload) VALUES (?,?,?)').run(hash(token),createdAt,JSON.stringify(payload));db.prepare('DELETE FROM translations WHERE session_id=? AND id NOT IN (SELECT id FROM translations WHERE session_id=? ORDER BY id DESC LIMIT 200)').run(hash(token),hash(token));return {...payload,id:Number(result.lastInsertRowid),createdAt};},
    history(token){return db.prepare('SELECT id,created_at,payload FROM translations WHERE session_id=? ORDER BY id DESC LIMIT 200').all(hash(token)).map(row=>({...JSON.parse(row.payload),id:row.id,createdAt:row.created_at}));},
    clear(token){return Number(db.prepare('DELETE FROM translations WHERE session_id=?').run(hash(token)).changes);},
    close(){db.close();}
  };
}
