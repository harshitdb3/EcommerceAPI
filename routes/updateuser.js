const express = require('express');
const router = express.Router();
const {client} = require('../database');

router.post('/addAddress',(req,response)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        response.send("User not loged in");
    }

    client.query('UPDATE users SET address = $1 WHERE UserId = $2', [req.body.address, UserId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rowCount > 0)
        {
            response.send("Address added successfully");
        }
    });

    

});

module.exports = router;
