require('dotenv').config();
const {PGHOST,PGPORT,PGUSER,PGPASSWORD,PGDATABASE } = process.env;
const {Client} = require('pg');


const client = new Client({
    host: PGHOST,
    port: PGPORT,
    user: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE
  });

// database connection and table creation

function connect()
{
    client.connect((err) => {
        if (err) {
          console.error('connection error', err.stack);
        } else {
          console.log('connected');  
         // createtables();
        }
      });


}

function createtables()
{
    //Check if users table exists if not create it
    client.query('CREATE TABLE IF NOT EXISTS users (name VARCHAR(100), email VARCHAR(100) PRIMARY KEY, password VARCHAR(100), isAdmin BOOLEAN, UserId VARCHAR(100) ,address VARCHAR(100))', (err, res) => 
    {
        if (err) throw err;

    });

    //Check if products table exists if not create it
    client.query('CREATE TABLE IF NOT EXISTS products (name VARCHAR(50),description VARCHAR(100), price INTEGER, productId VARCHAR(50) PRIMARY KEY, quantity INTEGER)', (err, res) =>
    {
        if (err) throw err;
    });

    //Check if usercart table exists if not create it
    client.query('CREATE TABLE IF NOT EXISTS usercart (UserId VARCHAR(50), productId VARCHAR(50), quantity INTEGER)', (err, res) =>
    {
        if (err) throw err;
    });
}

module.exports = {client,connect};
