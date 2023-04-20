const express =  require('express');
const session = require('express-session')
const sequelize = require('./config/sequelize');
const app = express();

app.use(session({
    secret: 'Secret Key here',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 300000 }
  }));

app.use(express.json());

sequelize.sync({}).then(() =>
{
console.log('Database & tables created!'); 
});

app.get('/',(req,res) => 
{
    res.send("Welcome to the store");

});

const signuprouter = require('./routes/signup');

const loginrouter = require('./routes/signin');

const signoutrouter = require('./routes/signout');

const productsrouter = require('./routes/products');

const updateuserrouter = require('./routes/updateuser');

const cart = require('./routes/cart');

app.use('/signup',signuprouter);

app.use('/signin',loginrouter);

app.use('/signout',signoutrouter);

app.use('/products',productsrouter);

app.use('/updateuser',updateuserrouter);

app.use('/cart',cart);

  
app.listen(3000,()=>
{
    console.log(`Listening at port ${3000}`);
})



