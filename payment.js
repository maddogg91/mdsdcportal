const Stripe = require('stripe')(process.env['stripeapi']);


async function payment(amount, url, res, id) {
const session = await Stripe.checkout.sessions.create({
  line_items: [
    {
      // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
      price_data: {
      product_data:{name: 'Project'},
      unit_amount_decimal: amount,
      currency: 'USD'
    },
      quantity: 1
    }
  ],
  mode: 'payment',
  success_url: `${url}/success?id=${id}`,
  cancel_url: `${url}/cancel?id=${id}`,
  automatic_tax: {enabled: true},
});
  return session.url;
  };
module.exports= {payment};