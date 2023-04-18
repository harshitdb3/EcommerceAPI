const express =  require('express');
const session = require('express-session')
// const User = require('./models/User');
// const Cart = require('./models/Cart');
// const Product = require('./models/Product');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { PGUSER, PGPASSWORD } = process.env;

//Conenct to the database
const {Client} = require('pg');


const client = new Client({
    host: 'localhost',
    port: 5432,
    user: PGUSER,
    password: PGPASSWORD,
    database: 'postgres'
  });

// database connection and table creation
client.connect((err) => {
    if (err) {
      console.error('connection error', err.stack);
    } else {
      console.log('connected');

    //Check if users table exists if not create it
    client.query('CREATE TABLE IF NOT EXISTS users (name VARCHAR(100), email VARCHAR(100) PRIMARY KEY, password VARCHAR(100), isAdmin BOOLEAN, UserId VARCHAR(100) ,address VARCHAR(100))', (err, res) => 
    {
        if (err) throw err;
        console.log(res);
    });

    //Check if products table exists if not create it
    client.query('CREATE TABLE IF NOT EXISTS products (name VARCHAR(50),description VARCHAR(100), price INTEGER, productId VARCHAR(50) PRIMARY KEY, quantity INTEGER)', (err, res) =>
    {
        if (err) throw err;
        console.log(res);
    });

    //Check if usercart table exists if not create it
    client.query('CREATE TABLE IF NOT EXISTS usercart (UserId VARCHAR(50), productId VARCHAR(50), quantity INTEGER)', (err, res) =>
    {
        if (err) throw err;
        console.log(res);
    });


    }
  });
  

// salt rounds for bcrypt us used to generate a salt for hashing the password
// which is then stored in the database instead of the plain text password
const saltRounds = 10;

// generate a salt for hashing the password
const salt = bcrypt.genSaltSync(saltRounds);

const app = express();

app.use(session({
    secret: 'Secret Key here',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 300000 }
  }));

app.use(express.json());

const port= 3000;



//Inmemory database for users and products

// const Users = []

// const Products = []



app.get('/',(req,res) => 
{
    res.send("Welcome to the store");

});


app.post('/signup',(req,responce)=>
{
    const name = req.body.name.slice(0, 50);
    const email = req.body.email.slice(0, 50);
    const isAdmin = req.body.isAdmin;


    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const UserId = uuidv4().slice(0, 50);

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

app.post('/signin',(req,resp)=>
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

app.post('/signout',(req,res)=>
{

    req.session.destroy();

    res.send('Sign out success');
});

app.get('/products',(req,resp)=>
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

app.post('/addAddress',isAdmin,(req,res)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
    }

    client.query('UPDATE users SET address = $1 WHERE UserId = $2', [req.body.address, UserId], (err, res) =>
    {
        if (err) throw err;
        console.log(res);
        if(res.rowCount > 0)
        {
            res.send("Address added successfully");
        }
    });

    

});


app.get('/cart',(req,responce)=>
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

app.post('/addtocart',(req,res)=>
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

app.post('/checkout',(req,res)=>
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

//MiddleWare for admin privileges to access the routes below it

function isAdmin(req,res,next)
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

app.post('/product',isAdmin,(req,responce)=>
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

app.put('/product',isAdmin,(req,res)=>
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

app.delete('/product',isAdmin,(req,res)=>
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




app.listen(3000,()=>
{
    console.log(`Listening at port ${port}`);
})



