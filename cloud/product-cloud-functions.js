const Product = Parse.Object.extend('Product');
//----------------- Cloud Code for Product Functions -----------------//

/**
 * @name productCreate
 * @description create a new product
 * @param {string} name
 * @param {number} price
 * @param {string} description
 * @param {array<string>} pictures
 * @param {array<string>} tags
 * @param {string} creatorObjectId
 */
Parse.Cloud.define('productCreate', (request, response) => {
  const name = request.params.name;
  const price = request.params.price;
  const description = request.params.description;
  const pictures = request.params.pictures;
  const tags = request.params.tags;
  const creatorObjectId = request.params.creatorObjectId;

  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', creatorObjectId);
  userQuery
    .first({ useMasterKey: true })
    .then((creator) => {
      if (creator != undefined) {
        const product = new Product();
        product.set('name', name);
        product.set('price', price);
        product.set('description', description);
        product.set('pictures', pictures);
        product.set('tags', tags);
        product.set('userObjectId', creatorObjectId);
        product.set('user', creator);
        product
          .save(null, { useMasterKey: true })
          .then((newProduct) => {
            response.success(newProduct);
          })
          .catch((err) => {
            response.error(err.code, err.message);
          });
      } else {
        response.error(404, `User not found for ${userObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name productUpdate
 * @description update one product
 * @param {Product{objectId, ...params}} product
 */
Parse.Cloud.define('productUpdate', (request, response) => {
  const product = request.params.product;

  const productQuery = new Parse.Query(Product);
  productQuery.equalTo('objectId', product.objectId);
  productQuery
    .first({ useMasterKey: true })
    .then((productToBeUpdated) => {
      if (productToBeUpdated != undefined) {
        Object.keys(product).forEach((field) => {
          productToBeUpdated.set(field, product[field]);
        });
        productToBeUpdated
          .save(null, { useMasterKey: true })
          .then((productUpdated) => {
            response.success(productUpdated);
          })
          .catch((err) => {
            response.error(err.code, err.message);
          });
      } else {
        response.error(404, `Product was not found for ${productObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name productDelete
 * @description delete one product
 * @param {string} productObjectId
 */
Parse.Cloud.define('productDelete', (request, response) => {
  const productObjectId = request.params.productObjectId;

  const productQuery = new Parse.Query(Product);
  productQuery.equalTo('objectId', productObjectId);
  productQuery
    .first({ useMasterKey: true })
    .then((product) => {
      if (product != undefined) {
        product
          .destroy({ useMasterKey: true })
          .then((result) => {
            response.success('Product was deleted');
          })
          .catch((err) => {
            response.error(err.code, err.message);
          });
      } else {
        response.error(404, `Product was not found for ${productObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name productGet
 * @description get one product by it's objectId
 * @param {string} productObjectId
 */
Parse.Cloud.define('productGet', (request, response) => {
  const productObjectId = request.params.productObjectId;

  const productQuery = new Parse.Query(Product);
  productQuery.equalTo('objectId', productObjectId);
  productQuery
    .first({ useMasterKey: true })
    .then((product) => {
      if (product != undefined) {
        response.success(product);
      } else {
        response.error(404, `Product was not found for ${productObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name productGetByFilter
 * @description get products by N params
 * @param {filter{...string : any}} filter
 */
Parse.Cloud.define('productGetByFilter', (request, response) => {
  const filter = request.params.filter;

  const productQuery = new Parse.Query(Product);
  Object.keys(filter).forEach((field) => {
    if (typeof filter[field] == typeof 'string') {
      productQuery.contains(field, filter[field]);
    } else if (typeof filter[field] == typeof []) {
      productQuery.containedIn(field, filter[field]);
    } else {
      productQuery.equalTo(field, filter[field]);
    }
  });
  productQuery
    .find({ useMasterKey: true })
    .then((products) => {
      if (products.length > 0) {
        response.success(products);
      } else {
        response.error(
          404,
          `No products were found for the filter ${JSON.stringify(filter)}`
        );
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});
