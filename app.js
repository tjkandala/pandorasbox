// configure environment variables
require("dotenv").config();

// configure twilio SMS API
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// configure serialport dependency to read data from arduinoxs
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");

const ardPort = new SerialPort("/dev/cu.usbmodem1411", { baudRate: 9600 });
const parser = ardPort.pipe(new Readline({ delimiter: "\n" }));

// the default recipient is me, default hidden item is chocolate. can be changed by the client.
var recipientNumber = process.env.MY_NUMBER;
var hiddenItem = "default item";

// Read the port data
ardPort.on("open", () => {
  console.log("serial port open");
});

parser.on("data", data => {
  const message = data.trim();
  console.log("message from arduino:", message);
  if (message === "opened") {
    client.messages
      .create({
        body: `Somebody opened Pandora's Box! The ${hiddenItem} is/are vulnerable!`,
        from: process.env.TWILIO_PHONE,
        to: recipientNumber
      })
      .then(message => console.log(message.sid))
      .done();
  }
});

// EXPRESS

// set up express web server
const express = require("express");
var app = express();
// to enable cross-origin resource sharing
var cors = require("cors");
app.use(cors());
const webPort = process.env.PORT || 4000;

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.get("/data", (req, res) => {
  // TODO: send initial values for number and message to client
  res.json({ recipientNumber: recipientNumber, hiddenItem: hiddenItem });
  console.log("data requested by client!");
});

app.post("/config", (req, res) => {
  // TODO: set recipient number and customize message based on config by client
  recipientNumber = req.body.recipientNumber;
  hiddenItem = req.body.hiddenItem;
  console.log("configured by client!");
  res.send({ recipientNumber: recipientNumber, hiddenItem: hiddenItem });
});

app.listen(webPort, () => console.log(`app listening on port ${webPort}!`));
