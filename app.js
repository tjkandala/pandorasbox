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

// the default recipient is me. can be changed by the client
var recipientNumber = process.env.MY_NUMBER;

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
        body: "Hello! You opened Pandora's Box!",
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
const app = express();
const webPort = 3000;

app.post("/config", (req, res) => {
  // TODO: set recipient number and customize message based on config by client
  console.log("hey!");
});

app.listen(webPort, () => console.log(`app listening on port ${webPort}!`));
