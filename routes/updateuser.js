const express = require('express');
const router = express.Router();
const {client} = require('../config/sequelize');
const User = require('../models/User');

async function updateAddress(UserId,newAddress,callback) {

    try
    {
        const user = await User.findOne({where: {id: UserId}});
        if(!user)
        {
            callback(null);
            return;
        }
        else
        {
            user.address = newAddress;
            user.save();
            console.log('address updated');
            callback(user);
        }

    }
    catch(err)
    {
        console.log(err);
    }
}

router.post('/addAddress',(req,response)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        response.send("User not loged in");
    }

    updateAddress(UserId,req.body.address, (user) =>
    {
        if(user)
        {
            console.log('address updated');
            response.status(200).send('Address update to ' + user.address);

        } 
        else 
        {        
            response.status(400).send('Cannot update address');
        }
    });
    
});

module.exports = router;
