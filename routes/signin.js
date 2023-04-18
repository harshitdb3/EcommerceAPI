const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {client} = require('../database');

router.post('/',(req,resp)=>
{

    const email = req.body.email;
    
    //Check if the user exists in the database
    client.query('SELECT * FROM users WHERE email = $1', [email], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rows.length > 0)
        {
            if(!bcrypt.compareSync(req.body.password, res.rows[0].password))
            {
                resp.status(401).send("Wrong email or password");
                return;
            }
            
            //Create a session for the user and store the userId in the session object for future use in other routes 
            // This is auto destroyed when the user signs out or the session expires which is set to 5 minutes in this case
            req.session.UserId = res.rows[0].userid;

            resp.send(`Login success , ${req.session.UserId}`);
        }
        else
        {
            resp.status(401).send("No email found");
        }
    });

});


module.exports = router;