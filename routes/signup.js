const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const {client} = require('../config/sequelize');


// salt rounds for bcrypt us used to generate a salt for hashing the password
// which is then stored in the database instead of the plain text password
const saltRounds = 10;

// generate a salt for hashing the password
const salt = bcrypt.genSaltSync(saltRounds);

async function createUser(name, email, hashedPassword, isAdmin , callback) {

    try
    {
        const user = await User.findOne({where: {email: email}});
        if(user)
        {
            callback(null);
            return;
        }

        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            isAdmin: isAdmin
        });
    
        callback(newUser);
    }
    catch(err)
    {
        console.log(err);
        callback(null);
    }


};

router.post('/',(req,response)=>
{
    const name = req.body.name;
    const email = req.body.email;
    const isAdmin = req.body.isAdmin;
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    
    createUser(name, email, hashedPassword, isAdmin , (user) =>
    {
        if(user)
        {
            response.status(200).send(user);
        } else 
        {

            response.status(400).send('User already exists');
        }
    });
    
});

module.exports = router;
