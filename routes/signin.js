const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {client} = require('../config/sequelize');
const User = require('../models/User');

async function getUser(email, callback) {

    try
    {
        const user = await User.findOne({where: {email: email}});
        callback(user);
    }
    catch(err)
    {
        console.log(err);
        callback(null);
    }
}

router.post('/',(req,resp)=>
{

    const email = req.body.email;

    getUser(email, (user) =>
    {
        if(!user)
        {
            resp.status(401).send("No user found with this email");
            return;
        }
        else
        {
            if(!bcrypt.compareSync(req.body.password, user.password))
            {
                resp.status(401).send("Wrong email or password");
                return;
            }
            
            //Create a session for the user and store the userId in the session object for future use in other routes 
            // This is auto destroyed when the user signs out or the session expires which is set to 5 minutes in this case
            req.session.UserId = user.id;

            resp.send(`Login success , ${req.session.UserId}`);
        }
    });
});


module.exports = router;