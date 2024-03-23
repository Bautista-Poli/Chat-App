
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv'
dotenv.config();

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
  },
});




/*
pool.connect()
pool.query('SELECT * FROM users',(err,res) => {
  if(!err){
    console.log(res.rows);
  }else{
    console.log("Error has ocurred",err.message)
  }
  pool.end
})
*/

/*
pool.connect()
const queryText = 'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3)';
id1= 2
id2= 1
msg= "Bien y vos?"
const values = [id1, id2, msg];

pool.query(queryText, values, (err, result) => {
  if (err) {
    console.error('Error executing query', err);
    // Handle error
  } else {
    console.log('Insert successful');
    // Handle success
  }
  pool.end
});
*/


export async function loadChat(user1ID,user2ID, msg) {
  console.log("Entro");
  const queryText = 'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3)';
  
  try {
    const result = await pool.query(queryText, [user1ID,user2ID, msg]);
    console.log('Successful');
    return result.rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err; // Re-throw the error to handle it outside
  }
}



export async function getUsers() {
  const queryText = 'SELECT * FROM users';
  
  try {
    const result = await pool.query(queryText);
    console.log('Successful');
    return result.rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err; // Re-throw the error to handle it outside
  }
}

export async function getUserId(username) {
  try {
    const queryText = 'SELECT user_id FROM users WHERE username = $1';
    console.log(username)
    const result = await pool.query(queryText, [username]);
    if (result.rows.length > 0) {
      return result.rows[0].user_id;
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error('Error querying database:', error);
    throw error;
  }
}

export async function getChats(user1Id, user2Id) {
  try {
    const queryText = `
      SELECT sender_id, receiver_id, message_text, sent_at
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY sent_at;
    `;
    const result = await pool.query(queryText, [user1Id, user2Id]);
    return result.rows;
  } catch (error) {
    console.error('Error querying database:', error);
    throw error;
  }
}

/*
async function getUser() {
  const client = await pool.connect();
  try {
    var result = await client.query('SELECT * FROM users');
    return result.rows;
  } finally {
    client.release();
  }
}

console.log(getUser())
*/
