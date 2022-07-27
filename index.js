const express = require("express");
const app = express();
let cors = require("cors");
const port = 8000;
let mysql = require("mysql");
const jwt = require("jsonwebtoken");
app.use(express.json());

app.use(cors());
let con = mysql.createConnection({
  host: "mysql-83577-0.cloudclusters.net",
  user: "raghu",
  port: 19566,
  database: "raghutest",
  password: "raghuram",
});

let secret = "tagNTracApp";

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get("/shipments", (req, res) => {
  console.log("req", req.query.id);
  try {
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      let shipments;
      let userId = req.query.id;
      con.query(
        "SELECT * FROM shipments where user_id = ?;",
        [userId],
        function (err, result) {
          if (err) throw err;
          shipments = result;
          console.log("Result: " + JSON.stringify(result));
          res.send({ shipments });
        }
      );
    } else {
      res.send("Invalid request");
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

app.get("/allShipments", (req, res) => {
  try {
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      let shipments;
      con.query("SELECT * FROM shipments;", function (err, result) {
        if (err) throw err;
        shipments = result;
        console.log("Result: " + JSON.stringify(result));
        res.send({ shipments });
      });
    } else {
      res.send("Invalid request");
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

app.post("/shipments/update", (req, res) => {
  try {
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      req = req.body;
      let status = req.status;
      let shipment_id = req.shipId;
      console.log("here", status);
      con.query(
        `Update shipments set delivery_status = ? where shipment_id = ?;`,
        [status, shipment_id],
        function (err, result) {
          if (err) throw err;
          console.log("Result: " + JSON.stringify(result));
          res.send({ message: "Success" });
        }
      );
    } else {
      res.send("Invalid request");
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

app.get("/deliveries", (req, res) => {
  console.log("req", req.query.id);
  try {
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      let shipments;
      let userId = req.query.id;
      con.query(
        "SELECT * FROM shipments where delivery_partner_id = ?;",
        [userId],
        function (err, result) {
          if (err) throw err;
          shipments = result;
          console.log("Result: " + JSON.stringify(result));
          res.send({ shipments });
        }
      );
    } else {
      res.send("Invalid request");
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

// app.get("/deliveries", (req, res) => {
//   console.log("req", req.query.id);
//   const decode = jwt.verify(req.headers.jwt, secret);
//   if (decode) {
//     let deliveries;
//     let userId = req.query.id;
//     con.query(
//       "SELECT * FROM deliveries where user_id = ?;",
//       [userId],
//       function (err, result) {
//         if (err) throw err;
//         deliveries = result;
//         console.log("Result: " + JSON.stringify(result));
//         res.send(deliveries);
//       }
//     );
//   } else {
//     res.send("Invalid request");
//   }
// });

app.get("/users", (req, res) => {
  try {
    let users;
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      con.query(
        "SELECT * FROM users where user_status = ? or user_status = ? and user_type = ? or user_type = ?;",
        [1, 2, 1, 2],
        function (err, result) {
          if (err) throw err;
          users = result;
          console.log("Result: " + JSON.stringify(result));
          res.send(users);
        }
      );
    } else {
      res.send("Invalid request");
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

app.post("/login", (req, res) => {
  try {
    req = req.body;
    let userReqObj = {
      email: req.email,
      password: req.password,
    };
    con.query(
      `SELECT * from users where email = ? and password = ? and user_status = ?`,
      [userReqObj.email, userReqObj.password, 1],
      function (err, result) {
        console.log("Result: " + JSON.stringify(result));
        if (err) throw err;
        let token;
        if (result.length > 0) {
          let userResObj = {
            user_id: result[0].user_id,
            first_name: result[0].first_name,
            last_name: result[0].last_name,
            email: result[0].email,
            user_type: result[0].user_type,
            password: result[0].password,
            user_status: result[0].user_status,
          };
          token = jwt.sign(userResObj, secret);
          console.log("token", token);
          res.send({
            login: "Successfull",
            token: token,
            userObj: userResObj,
          });
        } else {
          res.send({
            login: "Unsuccessfull",
            token: token,
          });
        }
      }
    );
  } catch (e) {
    res.send("Invalid request");
  }
});

app.post("/users", (req, res) => {
  try {
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      req = req.body;
      let userReqObj = {
        first_name: req.first_name,
        last_name: req.last_name,
        email: req.email,
        user_type: req.user_type,
        password: req.password,
      };
      con.query(
        `INSERT INTO users (first_name, last_name, email, user_type,user_status, password) values (?, ?, ?, ?, ?, ?)`,
        [
          userReqObj.first_name,
          userReqObj.last_name,
          userReqObj.email,
          userReqObj.user_type,
          1,
          userReqObj.password,
        ],
        function (err, result) {
          if (err) throw err;
          console.log("Result: " + JSON.stringify(result));
          res.send({
            message: "Success",
          });
        }
      );
    } else {
      res.send("Invalid request");
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

app.post("/users/update", (req, res) => {
  try {
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      req = req.body;
      let userReqObj = {
        email: req.email,
        status: req.status,
      };
      con.query(
        `Update users set user_status = ? where email = ?;`,
        [userReqObj.status, userReqObj.email],
        function (err, result) {
          if (err) throw err;
          console.log("Result: " + JSON.stringify(result));
          res.send({ message: "Success" });
        }
      );
    } else {
      res.send({ message: "Failure" });
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

app.post("/shipments", (req, res) => {
  try {
    const decode = jwt.verify(req.headers.jwt, secret);
    if (decode) {
      req = req.body;
      let shipmentsReqObj = {
        name: req.name,
        source_loc: req.source_loc,
        target_loc: req.target_loc,
        user_id: req.user_id,
      };
      con.query(
        "SELECT * FROM users where user_status = ? and user_type = ?;",
        [1, 2],
        function (err, result) {
          if (err) throw err;
          console.log("Result: " + JSON.stringify(result));
          insertAndAssignShipmnent(shipmentsReqObj, result, res);
        }
      );
    } else {
      res.send("Invalid request");
    }
  } catch (e) {
    res.send("Invalid request");
  }
});

const insertAndAssignShipmnent = (shipmentsReqObj, deliveryPartners, res) => {
  try {
    let deliveryPartnersUserIds = [];
    for (let i = 0; i < deliveryPartners.length; i++) {
      deliveryPartnersUserIds.push(deliveryPartners[i].user_id);
    }
    const random = Math.floor(Math.random() * deliveryPartnersUserIds.length);
    let randomUserId = deliveryPartnersUserIds[random];
    con.query(
      `INSERT INTO shipments (name, source_loc, target_loc, user_id, delivery_status, delivery_partner_id) values (?, ?, ?, ?, ?, ?)`,
      [
        shipmentsReqObj.name,
        shipmentsReqObj.source_loc,
        shipmentsReqObj.target_loc,
        shipmentsReqObj.user_id,
        0,
        randomUserId,
      ],
      function (err, result) {
        if (err) throw err;
        console.log("Result: " + JSON.stringify(result));
        res.send({ message: "Success" });
      }
    );
  } catch (e) {
    res.send("Invalid request");
  }
};

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
