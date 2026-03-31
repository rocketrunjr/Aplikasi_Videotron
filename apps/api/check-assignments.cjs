const sqlite3 = require('better-sqlite3');
const db = new sqlite3('sqlite.db');
const user = db.prepare("SELECT id, email, name, telegram_chat_id FROM user WHERE email='petugas1@videotron.local'").get();
console.log("User:", user);
const assignments = db.prepare("SELECT * FROM petugas_assignments WHERE user_id = ?").all(user.id);
console.log("Assignments for user:", assignments);
