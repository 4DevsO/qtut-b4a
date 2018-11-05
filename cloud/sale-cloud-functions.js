const Sale = Parse.Object.extend('Sale');
const Product = Parse.Object.extend('Product');
//----------------- Cloud Code for Sale Functions -----------------//

/**
 * @name saleCreate
 * @description create a new sale
 * @param {boolean} fixed
 * @param {array<string>} products
 * @param {string} mainProductObjectId
 * @param {boolean} card
 * @param {date} closeTime
 * @param {geopoint} location
 * @param {string} locationDescription
 * @param {string} creatorObjectId
 */
Parse.Cloud.define('saleCreate', (request, response) => {
  const fixed = request.params.fixed;
  const products = request.params.products;
  const mainProductObjectId = request.params.mainProductObjectId;
  const card = request.params.card;
  const closeTime = request.params.closeTime;
  const location = request.params.location;
  const locationDescription = request.params.locationDescription;
  const creatorObjectId = request.params.creatorObjectId;

  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('objectId', creatorObjectId);
  userQuery
    .first({ useMasterKey: true })
    .then((creator) => {
      if (creator != undefined) {
        const productQuery = new Parse.Query(Product);
        productQuery.containedIn('objectId', products);
        productQuery
          .find({ useMasterKey: true })
          .then((fetchedProducts) => {
            if (fetchedProducts.length > 0) {
              const mainProductQuery = new Parse.Query(Product);
              mainProductQuery.equalTo('objectId', mainProductObjectId);
              mainProductQuery
                .first({ useMasterKey: true })
                .then((mainProduct) => {
                  if (mainProduct != undefined) {
                    const sale = new Sale();
                    sale.set('fixed', fixed);
                    sale.set('products', fetchedProducts);
                    sale.set('mainProductObjectId', mainProductObjectId);
                    sale.set('mainProduct', mainProduct);
                    sale.set('card', card);
                    sale.set('closeTime', closeTime);
                    sale.set('location', location);
                    sale.set('locationDescription', locationDescription);
                    sale.set('userObjectId', creatorObjectId);
                    sale.set('user', creator);
                    sale.set('active', true);
                    sale
                      .save(null, { useMasterKey: true })
                      .then((newSale) => {
                        response.success(newSale.toJSON());
                      })
                      .catch((err) => {
                        response.error(err.code, err.message);
                      });
                  } else {
                    response.error(
                      404,
                      `Main product not found for objectId ${mainProductObjectId}`
                    );
                  }
                })
                .catch((err) => {
                  response.error(err.code, err.message);
                });
            } else {
              response.error(
                404,
                `No products were found for ObjectsIds ${products}`
              );
            }
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
 * @name saleDelete
 * @description delete one sale
 * @param {string} saleObjectId
 */
Parse.Cloud.define('saleDelete', (request, response) => {
  const saleObjectId = request.params.saleObjectId;

  const saleQuery = new Parse.Query(Sale);
  saleQuery.equalTo('objectId', saleObjectId);
  saleQuery
    .first({ useMasterKey: true })
    .then((sale) => {
      if (sale != undefined) {
        sale
          .destroy({ useMasterKey: true })
          .then((result) => {
            response.success('Sale was deleted');
          })
          .catch((err) => {
            response.error(err.code, err.message);
          });
      } else {
        response.error(404, `Sale was not found for ${saleObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name saleUpdate
 * @description update one sale
 * @param {Sale{objectId, ...params}} sale
 */
Parse.Cloud.define('saleUpdate', (request, response) => {
  const sale = request.params.sale;

  const saleQuery = new Parse.Query(Sale);
  saleQuery.equalTo('objectId', sale.objectId);
  saleQuery
    .first({ useMasterKey: true })
    .then((saleToBeUpdated) => {
      if (saleToBeUpdated != undefined) {
        Object.keys(sale).forEach((field) => {
          saleToBeUpdated.set(field, sale[field]);
        });
        saleToBeUpdated
          .save(null, { useMasterKey: true })
          .then((saleUpdated) => {
            response.success(saleUpdated.toJSON());
          })
          .catch((err) => {
            response.error(err.code, err.message);
          });
      } else {
        response.error(404, `Sale was not found for ${sale.objectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name saleGet
 * @description get one sale by objectId
 * @param {string} saleObjectId
 */
Parse.Cloud.define('saleGet', (request, response) => {
  const saleObjectId = request.params.saleObjectId;

  const saleQuery = new Parse.Query(Sale);
  saleQuery.equalTo('objectId', saleObjectId);
  saleQuery.include('products');
  saleQuery.include('mainProduct');
  saleQuery.include('user');
  saleQuery
    .first({ useMasterKey: true })
    .then((sale) => {
      if (sale != undefined) {
        response.success(sale.toJSON());
      } else {
        response.error(404, `Sale was not found for ${saleObjectId}`);
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name saleGetByFilter
 * @description get sales by filter
 * @param {filter{...string : any}} filter
 */
Parse.Cloud.define('saleGetByFilter', (request, response) => {
  const filter = request.params.filter;

  const saleQuery = new Parse.Query(Sale);
  saleQuery.include('products');
  saleQuery.include('mainProduct');
  saleQuery.include('user');
  Object.keys(filter).forEach((field) => {
    if (typeof filter[field] == typeof 'string') {
      saleQuery.contains(field, filter[field]);
    } else if (typeof filter[field] == typeof []) {
      saleQuery.containedIn(field, filter[field]);
    } else {
      saleQuery.equalTo(field, filter[field]);
    }
  });
  saleQuery
    .find({ useMasterKey: true })
    .then((sales) => {
      if (sales.length > 0) {
        const salesJSON = sales.map((sale) => sale.toJSON());
        response.success(salesJSON);
      } else {
        response.error(
          404,
          `No sales were found for the filter ${JSON.stringify(filter)}`
        );
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});

/**
 * @name saleGetByLocationRadius
 * @description get sales by location proximity
 * @param {geopoint} location
 * @param {number} radius
 */
Parse.Cloud.define('saleGetByLocationRadius', (request, response) => {
  const location = request.params.location;
  const radius = request.params.radius;

  const saleQuery = new Parse.Query(Sale);
  saleQuery.include('products');
  saleQuery.include('mainProduct');
  saleQuery.include('user');
  saleQuery.withinKilometers('location', location, radius, true);
  saleQuery
    .find({ useMasterKey: true })
    .then((sales) => {
      if (sales.length > 0) {
        const salesJSON = sales.map((sale) => sale.toJSON());
        response.success(salesJSON);
      } else {
        response.error(
          404,
          `No sales were found for the ${radius}km and location ${JSON.stringify(
            location
          )}`
        );
      }
    })
    .catch((err) => {
      response.error(err.code, err.message);
    });
});
