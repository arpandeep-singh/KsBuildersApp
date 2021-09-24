const dotenv = require("dotenv");

const company = {
  email: process.env.COMPANY_EMAIL,
  contact: process.env.COMPANY_CONTACT,
  hst: process.env.COMPANY_HST,
};

module.exports = company;
