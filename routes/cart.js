const express = require('express');
const router = express.Router();
const {client} = require('../database');


router.get('/',(req,responce)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        responce.send("User not loged in");
        return;
    }

    //Get all products in the cart from the database
    client.query('SELECT * FROM usercart WHERE UserId = $1', [UserId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rows.length > 0)
        {
            responce.send(res.rows);
        }
        else
        {
            responce.send("Cart is empty");
        }
    });


});


async function getCheckoutPrice(UserId,callback)
{
    try
    {
      
        //Get product id and quantity from cart
        const productsincart = await new Promise((resolve, reject) =>
        {
        
            client.query('SELECT * from usercart WHERE UserId = $1', [UserId], (err, res) =>
            {
                if (err) throw err;
                console.log(res);
                if(res.rows.length > 0)
                {
                    resolve(res.rows);
                }
                else
                {
                    reject("Cart is empty");
                }
            });
        });

        var productQuantiymap = new Map();

        //Get price of each product from the database

        for(var i = 0; i < productsincart.length; i++)
        {
            const product = await new Promise((resolve, reject) =>
            {
                client.query('SELECT * from products WHERE productId = $1', [productsincart[i].productid], (err, res) =>
                {
                    if (err) throw err;
                    if(res.rows.length > 0)
                    {
                        resolve(res.rows[0]);
                    }
                    else
                    {
                        reject("No products found");
                    }
                });

            });

            productQuantiymap.set(productsincart[i].productid, {price: product.price, quantity: productsincart[i].quantity});
        }

        //Delete all products from the cart

        await client.query('DELETE FROM usercart WHERE UserId = $1', [UserId], (err, res) =>
        {
            if (err) throw err;
        });

        var totalprice = 0;

        productQuantiymap.forEach((value, key) =>
        {
            totalprice += value.price * value.quantity;
        });
        callback(totalprice);

        

    }
    catch(err)
    {
        console.log(err);
    }

}

router.post('/checkout',(req,res)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
        return;
    }

    getCheckoutPrice(UserId,(totalPrice)=>
    {
        console.log("Total price is " + totalPrice);
        res.send("Total price is " + totalPrice);
    });

});

router.post('/add',(req,res)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
        return;
    }

    //Check if the product is already in the cart in database
    client.query('SELECT * FROM usercart WHERE UserId = $1 AND productId = $2', [UserId, req.body.productId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        
        if(res.rows.length > 0)
        {
            client.query('UPDATE usercart SET quantity = $1 WHERE UserId = $2 AND productId = $3', [req.body.quantity, UserId, req.body.productId], (err, res) =>
            {
                if (err) throw err;
                console.log(res);
            });
        }
        else
        {
            client.query('INSERT INTO usercart (UserId, productId, quantity) VALUES ($1, $2, $3)', [UserId, req.body.productId, req.body.quantity], (err, res) =>
            {
                if (err) throw err;
                console.log(res);
            });
        }
        
    });

    res.send("Product added to cart");


});


module.exports = router;


