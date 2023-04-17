class Product{
    constructor(name,description,price,productId)
    {
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.price = price;
    }
}

module.exports = Product;