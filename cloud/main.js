const UserCloudFunctions = require('./user-cloud-functions');
const ProductCloudFunctions = require('./product-cloud-functions');
const SaleCloudFunctions = require('./sale-cloud-functions');

Parse.Cloud.define('hello', (request, response) => {
  response.success('Hello world!');
});
