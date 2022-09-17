const express = require("express");
const app = express();
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const sendmail = require("sendmail")();
var md = require("markdown-it")();
const fs = require("fs");
var minify = require("html-minifier").minify;
const xss = require("xss")

app.set("trust proxy", 1);

const apiLimiter = rateLimit({
  windowMs: 60000,
  max: 3
});
app.use("/submit/", apiLimiter);

app.use(express.static("views"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.get("/submit", (req, res) => {
  // Тема
  var subject = req.query.subject;
  // Имя
  var name = req.query.name;
  // Почта
  var email = req.query.email;
  // Сообщение
  var body = req.query.body;
  
  console.log(subject, name, email, body);
  var mail = "aleksejseryj659@yandex.ru"
  var err;
  if (typeof err == "string") {
    res.send(err).status(400);
  } else {
    res.send(`
<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="refresh" content="5; URL=https://worldplay.tk/" />
      <link rel="icon" href="https://cdn.worldplay.tk/cdn/general/favicon.ico" />
      <link rel="stylesheet" href="https://cdn.worldplay.tk/style.css" />
      <title>Отправлено!</title>
    </head>
    <body>
      <h1>The message has been sent. In a few seconds you will be taken to the main page</h1>
    </body>
  <html>`)
    //res.send(xss(`Сообщение отправлено! -> Тема: ${subject} -> Имя: ${name} -> Почта: ${email} -> Сообщение: ${body}`));
    //setTimeout(() => res.redirect("https://worldplay.tk"), 5000)
    
    var res = `
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          ${fs.readFileSync("./style.css", "utf8")}
        </style>
      </head>
      <body>
        <article>
          <p>
            Тема: ${md.render(subject)}
            Имя: ${md.render(name)}
            Почта: ${md.render(email)}
            Сообщение: ${md.render(body)}
          </p>
        </article>
      </body>
    </html>`;
    sendmail(
      {
        from: "feedback@worldplay.tk",
        to: "aleksejseryj659@yandex.ru",
        subject: subject,
        html: minify(res, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true
        })
      },
      function(err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
      }
    );
  }
});
const listener = app.listen(process.env.PORT, () => {
  console.log(`Порт приложения ${listener.address().port}`);
});
