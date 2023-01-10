const express = require("express");
const bodyParser = require("body-parser");

const jwt_decode = require("jwt-decode");

const app = express();

const port = process.env.PORT || 8080;

const cors = require("cors");
app.use(cors());

const passport = require("passport");
require("./passport");

require("dotenv").config();
const mongoose = require("mongoose");
const Models = require("./models.js");

const Panos = Models.Pano;
const Users = Models.User;

// Server Side input validation module
const { check, validationResult } = require("express-validator");

// Connect to local mongodb (use shell and run mongosh)
// mongoose.connect("mongodb://localhost:27017/Best360iesDB", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// Connect to mongodb Atlas
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Setup body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

let auth = require("./auth")(app);

// ========================
// GET routes
// ========================

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Welcome to the Best360ies API!");
});

// ----------------------------------------------------------------------
// READ - Returns a list of all Panoramic photos of the global collection
// ----------------------------------------------------------------------
// . This route will return a list of all Panoramic photos of the global collection.
// . User needs to be logged in to acces the list.
// . The list is composed of JSON Objects

app.get(
  "/panos",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Panos.find()
      .then((panos) => {
        res.status(201).json(panos);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// ------------------------------------------------------------------------
// READ - Returns data in JSON format of specific Panoramic photo by panoId
// ------------------------------------------------------------------------

app.get(
  "/panos/:panoId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Panos.findOne({ _id: req.params.panoId })
      .then((pano) => {
        if (pano) {
          res.status(200).json(pano);
        } else {
          res.status(400).send("No such a Panoramic photo in the database.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// --------------------------------------------------------------------------------------------------
// READ - Returns a list of all Panoramic photos of the collection added by a specific User by userId
// --------------------------------------------------------------------------------------------------
app.get(
  "/panos/users/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Panos.find({ addedByUserId: req.params.userId })
      .then((pano) => {
        if (pano) {
          res.status(200).json(pano);
        } else {
          res.status(400).send("No such a Panoramic photo in the database.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// -----------------------------------------------------------
// READ - Return a list (JSON Objects) of ALL registered users
// -----------------------------------------------------------
/**
 * Gets a list of users from the API
 * @returns An array of all users as object in json
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let token = req.headers.authorization;
    let decodedToken = jwt_decode(token);

    if (decodedToken.role == "admin") {
      Users.find()
        .then((users) => {
          if (!users) {
            res.status(400).send("No User in the database.");
          } else {
            res.status(200).json(users);
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error: " + err);
        });
    } else {
      res.status(401).send("Not authorized.");
    }
  }
);

// --------------------------------------------------------------
// READ - Return data (JSON Object) about a single User by userId
// --------------------------------------------------------------
/**
 * Gets data about a single user from the API
 * @returns an object in json
 */
app.get(
  "/users/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ _id: req.params.userId })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// =============
// POST requests
// =============

// -------------------------------------------------------------------------
// CREATE - new Panoramic Photo to the global collection of Panoramic Photos
// -------------------------------------------------------------------------
/**
 * Adds a new Panoramic Photo to the global collection of Panoramic Photos
 * @returns an object in json format
 */
app.post(
  "/panos/users/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Check the number of panos already added by the user with the userId

    Users.findOne({ _id: req.params.userId })
      .then((user) => {
        // res.json(user);
        console.log(
          "The number of Panos added already is: ",
          user.addedPanos.length + 1
        );

        // If the number of added Panos is below the allowed max number, the user is authorized to proceed. Otherwise there will be a message.
        if (user.addedPanos.length < user.panoMax) {
          console.log(
            "Ok, Pano can be added as the max number of Panos allowed is not reached."
          );
          Panos.findOne({ googlePanoId: req.body.googlePanoId }).then(
            (pano) => {
              if (pano) {
                return res
                  .status(400)
                  .send(req.body.googlePanoId + " already exists");
              } else {
                Panos.create({
                  panoUrl: req.body.panoUrl,
                  googlePanoId: req.body.googlePanoId,
                  latitude: req.body.latitude,
                  longitude: req.body.longitude,
                  heading: req.body.heading,
                  pitch: req.body.pitch,
                  country: req.body.country,
                  areaName: req.body.areaName,
                  addedByUserId: req.params.userId,
                  staticImgUrl: req.body.staticImgUrl,
                })
                  .then((pano) => {
                    // console.log(
                    //   "pano Id to be added to the User addedPano: ",
                    //   pano._id
                    // );
                    // Update the user details to add the panoId to the list of addedPanos
                    Users.findOneAndUpdate(
                      { _id: req.params.userId },
                      {
                        $addToSet: { addedPanos: pano._id },
                      },
                      { new: true }, // This line makes sure that the updated document is returned
                      (err, updatedUser) => {
                        if (err) {
                          console.error(err);
                          res.status(500).send("Error: " + err);
                        } else {
                          // res.json(updatedUser);
                          res.status(201).json(pano);
                        }
                      }
                    );
                    // res.status(201).json(pano);
                  })
                  .catch((error) => {
                    console.error(error);
                    res.status(500).send("Error: " + error);
                  });
              }
            }
          );
        } else {
          console.log(
            "You have reach the max number of pano allowed with your account as this is a demo App only."
          );
          res.send(
            "You have reach the max number of pano allowed with your account as this is a demo App only."
          );
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// ---------------------------------------------------------------------
// CREATE - Allow new User to register (Add a new user to the usersList)
// ---------------------------------------------------------------------
/**
 * Registers a new user
 * @returns a new user object in json format
 */
app.post(
  "/users",
  [
    check(
      "username",
      "Username with a minimum of 5 characters is required"
    ).isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.username + " already exists");
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
            role: req.body.role,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// ----------------------------------------------------------------------------
// CREATE - Add a Panoramic Photo to the user list of favorite Panoramic Photos
// ----------------------------------------------------------------------------
/**
 * Adds a selected Panoramic Photo to the user's list of favorite Panoramic Photos
 * @returns an object in json format
 */
app.post(
  "/users/:userId/panos/:panoId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.userId },
      {
        $addToSet: { favoritePanos: req.params.panoId },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// ===============
// DELETE requests
// ===============

// -----------------------------------------------------------------------
// DELETE a Panoramic Photo from the global collection of Panoramic Photos
// -----------------------------------------------------------------------
/**
 * Deletes a selected Panoramic Photo from the global collection of Panoramic Photos
 * @returns an object in json format
 */
app.delete(
  "/panos/:panoId/users/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Removes from panos list
    Panos.findOneAndRemove({ _id: req.params.panoId })
      .then((pano) => {
        if (!pano) {
          res.status(400).send(req.params.panoId + " was not found");
        } else {
          res.status(200).send(req.params.panoId + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });

    // Removes from addedPanos
    Users.findOneAndUpdate(
      { _id: req.params.userId },
      {
        $pull: { addedPanos: req.params.panoId },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        }
      }
    );
  }
);

// ----------------------------------------------------------
// DELETE a Panoramic Photo from the user's list of favorites
// ----------------------------------------------------------
/**
 * Deletes a selected Panoramic Photo from the user's list of favorites
 * @returns an object in json format
 */
app.delete(
  "/users/:userId/panos/:panoId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.userId },
      {
        $pull: { favoritePanos: req.params.panoId },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

// ----------------------------------------
// DELETE a User from the User's collection
// ----------------------------------------
/**
 * Delete a User from the User's collection
 */
app.delete(
  "/users/:userId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ _id: req.params.userId })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.userId + " was not found");
        } else {
          res.status(200).send(req.params.userId + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// =============
// PUT requests
// =============

// UPDATE - Allow an existing User to update its details
/**
 * Update User's data
 * @returns an object in json format
 */
app.put(
  "/users/:userId",
  passport.authenticate("jwt", { session: false }),
  [
    check(
      "username",
      "Username with a minimum of 5 characters is required"
    ).isLength({ min: 5 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate(
      { _id: req.params.userId },
      {
        $set: {
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
          // res.status(200).send(" Update done.");
        }
      }
    );
  }
);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
