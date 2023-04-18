const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const {client} = require('../database');


router.get('/',(req,resp)=>
{
    //Get all products from the database
    client.query('SELECT * FROM products', (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rows.length > 0)
        {
            resp.send(res.rows);
        }
        else
        {
            resp.send("No products available");
        }
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
    client.query('SELECT isAdmin FROM users WHERE UserId = $1', [UserId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rows.length > 0)
        {
            if(res.rows[0].isadmin == true)
            {
                next();
            }
            else
            {
                res.status(401).send('You are Not an Admin');
            }
        }
    });
    
}


router.post('/',isAdmin,(req,responce)=>
{
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const productId = uuidv4();

    // Create a row in the database for the product

    client.query('INSERT INTO products (name, price, description, productId) VALUES ($1, $2, $3, $4)', [name, price, description, productId], (err, res) =>
    {
        if (err) throw err;
        else
        {
            responce.send(`Product added with product data: name=${name}, price=${price}, description=${description} , productId=${productId}`);
        }
    });


});


router.put('/',isAdmin,(req,res)=>
{
    //Update the product in the database

    client.query('UPDATE products SET name = $1, price = $2, description = $3 WHERE productId = $4', [req.body.name, req.body.price, req.body.description, req.body.productId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rows.length > 0)
        {
            res.send(`Product updated with product data: name=${req.body.name}, price=${req.body.price}, description=${req.body.description} , productId=${req.body.productId}`);
        }
    });
    

});

router.delete('/',isAdmin,(req,res)=>
{
    //Delete the product from the database

    client.query('DELETE FROM products WHERE productId = $1', [req.body.productId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rows.length > 0)
        {
            res.send(`Product deleted with product data: productId=${req.body.productId}`);
        }
    });

});

module.exports = router;
