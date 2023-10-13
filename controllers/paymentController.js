const Product = require('../models/product');
const Cart = require('../models/cart');
const Payment = require('../models/payment');
const Order = require('../models/order');
const User = require('../models/user');
const Address = require('../models/address');
const Category = require('../models/category');


const pdf = require('html-pdf');








// userside
const generateInvoice = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const userId = req.session.user_id; // Assuming userId is stored in the session after authentication

    if (!userId) {

      const message = 'User not authenticated.';
      return res.render('userSweetAlert.ejs', { message });
   
    }

    // Retrieve the order by orderId and populate the necessary fields
    const order = await Order.findById(orderId)
      .populate('paymentId');

    if (!order) {
      const message= 'Order not found' 
      return  res.render('userSweetAlert.ejs', { message });
    }

    // Render the HTML template with the order data
    const htmlTemplate = renderInvoiceTemplate(order);

    // Configure PDF options
    const pdfOptions = { format: 'Letter' }; // You can adjust the format as needed

    // Generate PDF from HTML content
    pdf.create(htmlTemplate, pdfOptions).toStream((error, stream) => {
      if (error) {
        console.error('Error generating PDF:', error);
        return  res.status(500).render('error', { error, status: 500 });
      }

      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${orderId}.pdf"`);

      // Pipe the PDF stream to the response
      stream.pipe(res);
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return  res.status(500).render('error', { error, status: 500 });
  }
};


function renderInvoiceTemplate(order) {
  const imagePath = '/images/logoFashionClub.png';

  // Define your HTML template as a string
  const template = `
    <!DOCTYPE html>
    <html>
      <head>
      <style>
			.invoice-box {
				max-width: 800px;
				margin: auto;
				padding: 30px;
				border: 1px solid #eee;
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
				font-size: 16px;
				line-height: 24px;
				font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
				color: #555;
			}

			.invoice-box table {
				width: 100%;
				line-height: inherit;
				text-align: left;
			}

			.invoice-box table td {
				padding: 5px;
				vertical-align: top;
			}

			.invoice-box table tr td:nth-child(2) {
				text-align: right;
			}

			.invoice-box table tr.top table td {
				padding-bottom: 20px;
			}

			.invoice-box table tr.top table td.title {
				font-size: 45px;
				line-height: 45px;
				color: #333;
			}

			.invoice-box table tr.information table td {
				padding-bottom: 40px;
			}

			.invoice-box table tr.heading td {
				background: #eee;
				border-bottom: 1px solid #ddd;
				font-weight: bold;
			}

			.invoice-box table tr.details td {
				padding-bottom: 20px;
			}

			.invoice-box table tr.item td {
				border-bottom: 1px solid #eee;
			}

			.invoice-box table tr.item.last td {
				border-bottom: none;
			}

			.invoice-box table tr.total td:nth-child(2) {
				border-top: 2px solid #eee;
				font-weight: bold;
			}

			@media only screen and (max-width: 600px) {
				.invoice-box table tr.top table td {
					width: 100%;
					display: block;
					text-align: center;
				}

				.invoice-box table tr.information table td {
					width: 100%;
					display: block;
					text-align: center;
				}
			}

			/** RTL **/
			.invoice-box.rtl {
				direction: rtl;
				font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
			}

			.invoice-box.rtl table {
				text-align: right;
			}

			.invoice-box.rtl table tr td:nth-child(2) {
				text-align: left;
			}
		</style>
      </head>
      <body>
      <div class="invoice-box">
      <h1>Invoice</h1>
      <table cellpadding="0" cellspacing="0">
      <tr class="top">
              <td colspan="2">
                <table>
                <tr>
                <td class="title">
                
                
                </td>
                    <td>
                        order Id: ${order._id}<br />
                   order   Created: ${order.createdAt ? order.createdAt.toDateString() : ''}<br />
                   
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                    <h3>Address:</h3>
                      ${order.address[0].houseNO || ''}<br />
                      ${order.address[0].street || ''}<br />
                      ${order.address[0].district || ''}, ${order.address[0].state || ''} ${order.address[0].pin || ''}
                    </td>
                    <td>
                      ${order.userId || ''}<br />
                      ${order.paymentId ? order.paymentId._id || '' : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Payment Method</td>
              <td>${order.paymentId.paymentType || ''}</td>
            </tr>
            <tr class="details">
              <td>${order.paymentId.paymentType || ''}</td>
              <td>${order.paymentId ? order.paymentId._id || '' : ''}</td>
            </tr>
            <tr class="heading">
              <td>Item</td>
              <td>Price</td>
            </tr>
            ${order.products.map((product) => `
              <tr class="item">
                <td>${product.productName || ''}</td>
                <td>$${product.price ? product.price.toFixed(2) : ''}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td></td>
              <td>Total: $${order.amount ? order.amount.toFixed(2) : ''}</td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

  return template;
}



module.exports = {
  generateInvoice 
}
