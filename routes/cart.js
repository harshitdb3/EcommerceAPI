const express = require('express');
const router = express.Router();
const {client} = require('../config/sequelize');
const UserCart = require('../models/UserCart');
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/',(req,response)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        response.send("User not loged in");
        return;
    }

    User.findByPk(UserId, {
        include: [Product]
        }).then(user =>
        {
            user.getProducts().then((products) =>  
            {
                response.send(products);
            });

        }).catch((err) =>
        {
            console.log(err);
        }
        );




});


async function getCheckoutPrice(UserId,callback)
{
    try
    {
      
        //Get product and quantity from cart
        var totalPrice = 0;
        var iproducts;
        User.findByPk(UserId, {
            include: [{
              model: Product,
              through: {
                attributes: ['quantity']
              }
            }]
          }).then(user => 
            {
            user.getProducts().then((products) =>
            {
                iproducts = products;
                products.forEach(product =>
                {
                    totalPrice += product.price * product.UserCart.quantity;
                    console.log("Usercart quantity is " + product.UserCart.quantity);
                }); 
                console.log("products are " + products);
           
            }).then(() =>
            {
              
              UserCart.destroy({
                  where: {
                      UserId: UserId
                      }
                  });
  
              }
              ).then(() =>
              {
                  console.log("Deleted from cart");
                  callback(iproducts,totalPrice);
  
              });

 

          });
            

    }
    catch(err)
    {
        console.log(err);
        callback(null,0);
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

    //Check if the User has the address updated

    User.findByPk(UserId).then((user) =>
    {
        if(!user.address)
        {
            res.send("Please update your address");
            return;
        }
        else
        {
            getCheckoutPrice(UserId,(products,price)=>
            {
                console.log("Total price is " + price);
                res.send(products + " Total price is " + price);
            });
        }
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
    UserCart.findOne({where: {UserId: UserId, ProductId: req.body.ProductId}}).then((usercart) =>
    {
        if(usercart)
        {
            //If the product is already in the cart, then update the quantity
            usercart.quantity = req.body.quantity;
            usercart.save();
            console.log("Product quantity updated");
        }
        else
        {
            //If the product is not in the cart, then add it to the cart
            UserCart.create({
                UserId: UserId,
                ProductId: req.body.ProductId,
                quantity: req.body.quantity
            }).then(() =>
            {
                console.log("Product added to cart");
            });
        }
    });

    res.send("Product added to cart");


});


module.exports = router;


