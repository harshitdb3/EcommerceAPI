class Cart {
    constructor() {
      this.products = [];

  
    }

    checkout() {
      this.products = [];
    }

    addProduct(product) {
      this.products.push(product);
    }
  }
  
  module.exports = Cart;
  