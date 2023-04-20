const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const {client} = require('../config/sequelize');
const User = require('../models/User');
const Product = require('../models/Product');


router.get('/',(req,resp)=>
{
    //Get all products from the database
   
    Product.findAll().then((products) =>
    {
        resp.send(products);

    }).catch((err) =>
    {
        console.log(err);
    });

});

//MiddleWare for admin privileges to access the routes below it

function isAdmin(req, res, next) 
{

    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
        return;
    }

    //Get is admin from user table in the database
    User.findByPk(UserId).then((user) =>
    {
        if(user.isAdmin)
        {
            next();
        }
        else
        {
            res.send("User is not an admin");
        }
    }).catch((err) =>
    {
        console.log(err);
    }
    );
  
    
}


router.post('/',isAdmin,(req,response)=>
{
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const quantity = req.body.quantity;

    // Create a row in the database for the product

    Product.create({
        name: name,
        price: price,
        description: description,
        quantity: quantity
    }).then((product) =>
    {
        response.status(200).send(product);

    }).catch((err) =>
    {
        response.status(400).send("Product not created");
        console.log(err);
    }
    );


});


router.put('/',isAdmin,(req,res)=>
{
    //Update the product in the database

    Product.findByPk(req.body.productId).then((product) =>
    {
        if(product)
        {
            product.name = req.body.name;
            product.price = req.body.price;
            product.description = req.body.description;
            product.save();
            res.status(200).send(product);
        }
        else
        {
            res.status(400).send("Product not found");
        }
    }
    ).catch((err) =>
    {
        console.log(err);
    }   
    );
    

});

router.delete('/',isAdmin,(req,res)=>
{
    //Delete the product from the database

    Product.findByPk(req.body.productId).then((product) =>
    {
        if(product)
        {
            product.destroy();
            res.status(200).send("Product deleted");
        }
        else
        {
            res.status(400).send("Product not found");
        }
    }
    ).catch((err) =>
    {
        console.log(err);
    }
    );

});

module.exports = router;
