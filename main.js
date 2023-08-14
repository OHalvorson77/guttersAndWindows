const express = require ('express');
const app=express();
const router=express.Router();
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');

const path = require('path');
     
const publicPath = path.join(__dirname, 'public');


const PORT=3000;
const mySQL= require('mysql2');
const database=mySQL.createConnection({
    host: "localhost",
    user: "root",
    password: "Hockey@2003",
    database: "guttersandwindows",
    port: 3306
});

app.listen(
    PORT,
    ()=>console.log("Connected to port: "+ PORT)
)

database.connect(function(err){
    if (err) throw err;
    console.log("CONNECTED!");
});

app.set('view engine', 'ejs')

app.get('', (req, res)=>{
    res.render('appointment')
})

app.get('/api/appointments', (req, res) => {
    const currentDate = new Date();
    const sql = 'SELECT appointmentDay, startTime, endTime, name FROM booking a inner join product b on a.productID=b.productID where a.confirmed=True and appointmentDay>? order by appointmentDay';
  
    database.query(sql, [currentDate],(err, results) => {
      if (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ error: 'An error occurred' });
        return;
      }
      res.json(results);
    });
  });


//Checks username and password of user/employee/admin
app.post('/', function(req,res){
    console.log("Made")
    var user= req.body.username
    var pass= req.body.password
    console.log(user);
    console.log(pass);
    var query ="SELECT Password FROM users WHERE Username = ?;"
    database.query(query ,user, function (err, result, fields) {
        if (err) throw err;
      
        else if (result[0].Password==pass){
            res.redirect("/users");
        }
        else{
            res.send("incorrect password")
            res.render("login")
        } 
    })
})




app.post('/submit', (req, res) => {
    const { date, startTime, endTime, productID, address, emailAddress} = req.body;

    const randomClientID = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    const sql = 'INSERT INTO booking (client_id, address, appointmentDay, startTime, endTime, productID, emailAddress) VALUES (?, ?, ?, ?, ?, ?,?)';
    database.query(sql, [randomClientID, address, date, startTime, endTime, productID, emailAddress], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('An error occurred');
        return;
      }

        // Sending an email
    const transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., 'Gmail', 'Yahoo', 'Outlook'
        auth: {
          user: 'windowsandguttersautomated@gmail.com',
          pass: 'jhchhcdllgbyoyxy'
        }
      });
  
      const mailOptions = {
        from: 'windowsandguttersautomated@gmail.com',
        to: 'owenhalvie@gmail.com',
        subject: 'Appointment Confirmation',
        text: `
        <p>Your appointment details:</p>
        <p>Date: ${date}</p>
        <p>Start Time: ${startTime}</p>
        <p>End Time: ${endTime}</p>
        <p>Address: ${address}</p>
        <p>clientID: ${randomClientID}</p>
       
        
        
      `
      };
  
      transporter.sendMail(mailOptions, (emailError, info) => {
        if (emailError) {
          console.error('Error sending email:', emailError);
        } else {
          console.log('Email sent:', info.response);
        }
      });
      console.log('Data inserted successfully');
      res.redirect('/');

    });
  });