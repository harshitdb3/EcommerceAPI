const express =  require('express');
const session = require('express-session')
const User = require('./models/User');
const Cart = require('./models/Cart');
const Product = require('./models/Product');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

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

const Users = []

const Products = []



app.get('/',(req,res) => 
{
    res.send("Welcome to the store");

});


app.post('/signup',(req,res)=>
{
    const name = req.body.name;
    const email = req.body.email;
    const isAdmin = req.body.isAdmin;

    if(Users.find(user => user.email === email))
    {
        res.status(400).send("Email already in use");
        return;
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const UserId = uuidv4();
    const user = new User(name,UserId,email,hashedPassword,isAdmin);

    Users.push(user);

    res.send(`Account created with user data: name=${name}, email=${email} please sign in to continue`);

});

app.post('/signin',(req,res)=>
{

    const email = req.body.email;
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const user = Users.find(user => user.email === email && user.hashedPassword === hashedPassword);

    if(!user)
    {
        res.status(401).send("Wrong email or password");
        return;
    }

    //Create a session for the user and store the userId in the session object for future use in other routes 
    // This is auto destroyed when the user signs out or the session expires which is set to 5 minutes in this case
    req.session.UserId = user.UserId;

    res.send(`Login success for user ${user.name} , ${req.session.UserId}`);

});

app.post('/signout',(req,res)=>
{

    req.session.destroy();

    res.send('Sign out success');
});

app.get('/products',(req,res)=>
{
    res.send(Products);

});

app.post('/addAddress',isAdmin,(req,res)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
    }

    const user = Users.find(user => user.UserId === UserId);

    if(user == null)
    {
        res.status(404).send("User not found");
        return;
    }

    user.addAddress(req.body.address);

    res.send("Address added");

});


app.get('/cart',(req,res)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
    }

    const user = Users.find(user => user.UserId === UserId);

    res.send(user.cart);



});

app.post('/addtocart',(req,res)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
    }

    const user = Users.find(user => user.UserId === UserId);
    const product = Products.find(product => product.productId === req.body.productId);

    if(product == null)
    {
        res.status(404).send("Product not found");
        return;
    }

    user.cart.addProduct(product);

    res.send("Product added to cart");


});

app.post('/checkout',(req,res)=>
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
    }
    

    const user = Users.find(user => user.UserId === UserId);

    if(user.address == null)
    {
        res.status(400).send("Please add an address to checkout");
        return;
    }

    user.cart.checkout();

    const total = user.cart.products.reduce((total,product) => total + product.price,0);

    res.send(`Checkout successfull, total amount to be paid is ${total}`);


});

//MiddleWare for admin privileges to access the routes below it

function isAdmin(req,res,next)
{
    const UserId = req.session.UserId;

    if(!UserId)
    {
        res.send("User not loged in");
    }

    const user = Users.find(user => user.UserId === UserId);

    if(user == null)
    {
        res.status(404).send("User not found");
        return;
    }

    if(user.isAdmin == true) next();
    else
    {
        res.status(401).send('You are Not an Admin');
    }
}

app.post('/product',isAdmin,(req,res)=>
{
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const productId = uuidv4();
    const product = new Product(name,price,description,productId);

    Products.push(product);

    res.send(`Product created with product data: name=${name}, price=${price}, description=${description} , productId=${productId}`);

});

app.put('/product',isAdmin,(req,res)=>
{
    var product = Products.find(product => product.productId === req.body.productId);
    if(product == null)
    {
        res.status(404).send("Product not found");
        return;
    }
    else 
    {
        product.name = req.body.name;
        product.price = req.body.price;
        product.description = req.body.description;
        res.send("Product updated");
    }
    

});

app.delete('/product',isAdmin,(req,res)=>
{
    var product = Products.find(product => product.productId === req.body.productId);
    if(product == null)
    {
        res.status(404).send("Product not found");
        return;
    }
    else 
    {
        Products.splice(Products.indexOf(product),1);
        res.send("Product deleted");
    }
    


});




app.listen(3000,()=>
{
    console.log(`Listening at port ${port}`);
})



