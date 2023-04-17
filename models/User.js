const Cart = require('./Cart');

class User{


    constructor(name,UserId,email,hashedPassword,isAdmin)
    {
        this.name = name;
        this.email = email;
        this.hashedPassword = hashedPassword;
        this.UserId = UserId;
        this.isAdmin = isAdmin;
        this.cart = new Cart();

        

    }

    addAddress(address)
    {
        this.address = address;
    }

    
}

module.exports = User;