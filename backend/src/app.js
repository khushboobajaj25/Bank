const express = require("express");
const alert = require('alert');
const popup = require('node-popup/dist/cjs.js');
const app = express();
const port = process.env.PORT || 3000;
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const { callbackify } = require("util");
const template_path = path.join(__dirname, "../templates/views");
const static_path = path.join(__dirname, "../public");
var detail_of_customer, detail_of_transaction;
var date_ob = new Date();
var JSAlert = require("js-alert");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(static_path));
app.set("views", template_path);

var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Khushi1234@",
    database: "bank",

})



app.get("/", function (request, response) {
    response.render("home");
})
app.get("/viewallcustomers", function (request, response) {

    conn.query("select * from customers order by id ", function (err, result, field) {
        if (err) throw err;
        response.render("viewallcustomers", { records: result });
    })
})
app.get("/sendmoney", function (request, response, next) {
    response.render("sendmoney");
})
app.post("/sendmoney", async function (request, response, next) {
    try {

        const sender = request.body.sender;
        const receiver = request.body.receiver;
        const amount = parseInt(request.body.Pay);
        console.log(sender);
        let senderBalance, receiverBalance;
        let bal;
        const sender_query = "select bankBalance from customers where email = '" + sender + "'";
        const receiver_query = "select bankBalance from customers where email = '" + receiver + "'";

        await conn.query(sender_query, function (err, result, fields) {
            if (err) throw err;
            senderBalance = result[0].bankBalance;


            bal = send_balance(senderBalance);

        })
        function send_balance(balance) {
            return balance;
        }
        await conn.query(receiver_query, async function (err, result, fields) {
            if (err) throw err;
            receiverBalance = parseInt(result[0].bankBalance);
            balance(receiverBalance)


        })

        function balance(receiverBalance) {
            senderBalance = bal;
            var maxid;

            if (senderBalance >= amount && amount > 0) {

                // adjust 0 before single digit date
                let date = ("0" + date_ob.getDate()).slice(-2);

                // current month
                let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

                // current year
                let year = date_ob.getFullYear();

                // current hours
                let hours = date_ob.getHours();

                // current minutes
                let minutes = date_ob.getMinutes();

                // current seconds
                let seconds = date_ob.getSeconds();

                let currentDate = year + "-" + month + "-" + date;
                let currentTime = hours + ":" + minutes + ":" + seconds;
                insert = "insert into transactions values('" + sender + "','" + receiver + "'," + amount + ",'" + currentDate + "','" + currentTime + "')";

                conn.query(insert, function (err, result, field) {
                    if (err) throw err;
                    console.log("insert successfully");
                })


                receiverBalance += parseInt(amount);

                senderBalance -= parseInt(amount);
                var receiver_update = "update customers set bankBalance = " + parseInt(receiverBalance.toString()) + " where email = '" + receiver + "'";
                conn.query(receiver_update, function (err, result, fields) {
                    if (err) throw err;

                });
                var sender_update = "update customers set bankBalance = " + parseInt(senderBalance.toString()) + " where email = '" + sender + "'";
                conn.query(sender_update, function (err, result, fields) {
                    if (err) throw err;

                });
                alert("Payment Done Successfully!");

            }
            else {

                alert("Payment Unsucceessful");
            }
            response.render("sendmoney")
        }


    }
    catch (err) {
        console.log(err);

    }


})
app.get("/transactionhistory", function (request, response) {
    conn.query("select * from transactions order by dateoftransfer desc ,timeoftransfer desc", function (err, result, field) {
        response.render("transactionhistory", { records: result })
    });
})
app.get("/viewdetails", function (request, response) {
    const email = request.query.detail;
    if (email === null) {
        response.render("viewdetails")
    }
    else {

        detail_of_customer = "select * from customers where email = '" + email + "'";
        console.log(email);
        conn.query(detail_of_customer, function (err, result, fields) {
            if (err) throw err;
            response.render("viewdetails", { record: result })
        })

    }
})

app.get("/transactionhistory2", function (request, response) {
    const email = request.query.detail;
    if (email === null) {
        response.render("transactionhistory2")
    }
    else {


        detail_of_transaction = "select * from transactions where senderemail = '" + email + "' or receiveremail = '" + email + "'order by dateoftransfer desc,timeoftransfer desc";

        conn.query(detail_of_transaction, function (err, result, record) {
            if (err) throw err;
            response.render("transactionhistory2", { records: result })
            console.log(result);
        })

    }
})

app.get("/addcustomers", function (request, response) {
    response.render("addcustomers");
})
app.post("/addcustomers", function (request, response, next) {
    try {
        const name = request.body.name;
        const email = request.body.email;
        const bankBalance = request.body.bankBalance;
        const accountno = request.body.accountno;
        const city = request.body.city;
        const mobileno = request.body.mobileno;
        const create = "insert into customers (name,email,bankBalance,accountno,city,mobileno) values('" + name + "','" + email + "'," + bankBalance + ",'" + accountno + "','" + city + "'," + mobileno + ");";
        conn.query(create, function (err, result, fields) {
            if (err) throw err;
            response.render("addcustomers");
        })
        alert("Created Successfully")
    }
    catch (error) {
        console.log(error);
    }
})












// detail_of_transaction = "select * from transactions where senderemail = '"+email+"' or receiveremail = '"+email+"'";

app.listen(port, function () {

    console.log("sucess");
})

