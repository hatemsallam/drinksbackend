const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const server = express();
server.use(cors());
server.use(express.json());
const PORT = process.env.PORT || 3001;
const { default: axios } = require('axios');
mongoose.connect('mongodb://localhost:27017/drink', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});



const drinkSchema = new mongoose.Schema({
    drinkName: String,
    drinkImg: String,
});
const ownerSchema = new mongoose.Schema({
    userEmail: String,
    drinks: [drinkSchema],
});
const ownerModel = mongoose.model('drink', ownerSchema);



const allDrinksHandler = (req, res) => {
    axios
        .get(process.env.API_SERVER)
        .then(result => {
            res.send(result.data.drinks);
        })
        .catch();
};


const userDrinksHandler = (req, res) => {
    const { userEmail } = req.query;
    console.log(userEmail)
    ownerModel.findOne({ userEmail: userEmail }, (err, result) => {
        if (err) console.log(err);
        else {
            // console.log(result.drinks)
            res.send(result.drinks);
        }
    });
};


const addDrinkHandler = (req, res) => {
    const { userEmail, drinkObj } = req.body;
    console.log('in add', userEmail, drinkObj)
    ownerModel.findOne({ userEmail: userEmail }, (err, result) => {
        if (err) console.log(err);
        else if (!result) {
            const newOwner = new ownerModel({
                userEmail: userEmail,  // same as name in the schema
                drinks: [drinkObj],
            });
            newOwner.save();
            console.log('in if else', result)
        } else {
            result.drinks.unshift(drinkObj);
            result.save();
            console.log('in else', result)
        }
    });
};


const removeDrinkHandler = (req, res) => {
    const { idx } = req.params;
    const { userEmail } = req.query;
    ownerModel.findOne({ userEmail: userEmail }, (err, result) => {
        if (err) console.log(err);
        else {
            result.drinks.splice(idx, 1);
            result.save().then(
                () => {
                    ownerModel.findOne({ userEmail: userEmail }, (err, result) => {
                        if (err) console.log(err);
                        else {
                            
                            res.send(result.drinks);

                        }
                    })
                }
            );
        }
    });
};


const updateDrinkHandler = (req, res) => {
    const { idx } = req.params;
    const { userEmail, drinkObj } = req.body;
    ownerModel.findOne({ userEmail: userEmail }, (err, result) => {
        if (err) console.log(err);
        else {
            result.drinks[idx] = drinkObj;
            result.save().then(
                () => {
                    ownerModel.findOne({ userEmail: userEmail }, (err, result) => {
                        if (err) console.log(err);
                        else {
                            console.log('in Update', result.drinks);
                            res.send(result.drinks);

                        }
                    })
                }
            );
        }
    });
};


server.get('/Drinks', allDrinksHandler);
server.get('/userDrinks', userDrinksHandler);
server.post('/addDrink', addDrinkHandler);
server.delete('/removeDrink/:idx', removeDrinkHandler);
server.put('/updateDrink/:idx', updateDrinkHandler);



server.listen(PORT, () => {
    console.log(`listing to port ${PORT}`);
});


