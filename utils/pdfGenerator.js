const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const hbs = allowInsecurePrototypeAccess(handlebars);
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const company = require("../utils/companyInfo");

const compile = async function (templateName, data) {
  const filePath = path.join(process.cwd(), "utils", `${templateName}.hbs`);
  const html = await fs.readFile(filePath, "utf-8");
  return hbs.compile(html)(data);
};

const createPdf = async (site) => {
  let modified_site = { ...site }._doc;
  modified_site.totalCostWithTax = modified_site.totalCost + modified_site.tax;
  modified_site.balance =
    modified_site.totalCostWithTax - modified_site.paidAmount;

  return await processPdf(modified_site);
};

async function processPdf(data) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const all_data = { data, company };

    const content = await compile("invoice", all_data);

    await page.setContent(content);
    await page.emulateMediaType("screen");

    const fileId = uuidv4();
    const folderToSaveTo = "pdf-invoices";
    const filePath = path.join(process.cwd(), folderToSaveTo, `${fileId}.pdf`);

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
    });
    console.log("Invoice Created");
    console.log(filePath);

    await browser.close();
    return `${folderToSaveTo}/${fileId}.pdf`;
  } catch (error) {
    console.log("Our error", error);
  }
}

module.exports = createPdf;
