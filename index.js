var express = require("express");
var app = express();
var cors = require("cors");
require("dotenv").config();
var shippo = require("shippo")("shippo_live_18ba52e44934d26e616fd32ea7bc1e8d96caec94");

app.use(express.json());
app.use(cors());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post("/api/getshipmentdetails", function (req, res) {
 try {
    shippo.shipment.create(
      {
        address_from: req.body.addressFrom,
        address_to: req.body.addressTo,
        parcels: [req.body.parcels],
        async: false,
      },
      function (err, shipment) {
        return res.json(shipment.rates);
      }
    );
  } catch (error) {
    console.log(error, "error");
  }
});

app.post("/api/getlabel", function (req, res) {
  try {
    shippo.transaction.create({
          "rate": req.body.rate,
          "label_file_type": "PNG",
          "async": false
      }, function(err, transaction) {
        return res.json(transaction.label_url);
      });
   } 
   catch (error) {
     console.log(error, "error");
   }
 });



app.post("/api/create-checkout-session", async (req, res) => {
  const { product } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",  
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/",
  });
  res.json({ id: session.id });
});

var server = app.listen(5600, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://localhost:5600", host, port);
});
