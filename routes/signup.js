const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const {client} = require('../database');

// salt rounds for bcrypt us used to generate a salt for hashing the password
// which is then stored in the database instead of the plain text password
const saltRounds = 10;

// generate a salt for hashing the password
const salt = bcrypt.genSaltSync(saltRounds);

router.post('/',(req,responce)=>
{
    const name = req.body.name.slice(0, 50);
    const email = req.body.email.slice(0, 50);
    const isAdmin = req.body.isAdmin;


    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const UserId = uuidv4();

    console.log(hashedPassword.length);

    client.query('INSERT INTO users (name, email, password, isAdmin, UserId) VALUES ($1, $2, $3, $4, $5)', [name, email, hashedPassword, isAdmin, UserId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rowCount > 0)
        {
            responce.send("User created successfully");
        }
        else
        {
            responce.status(400).send("User creation failed email already exists");
        }
    });


});

module.exports = router;
