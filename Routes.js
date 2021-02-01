/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const path = require('path');
const fs = require('fs');
const util = require('util');
const readFileP = util.promisify(fs.readFile);

const TATTOO_FLASH = {
    '1': {
        name: 'Maple Story',
        image: [path.join(__dirname, 'src/database/tattoo_flash_01')],
        description: 'RM500',
        price: 50000
    },
    '2': {
        name: 'Skeleton King',
        image: [path.join(__dirname, 'src/database/tattoo_flash_02')],
        description: 'RM12,500',
        price: 1250000
    },
    '3': {
        name: 'Super Mario',
        image: [path.join(__dirname, 'src/database/tattoo_flash_03')],
        description: 'RM2,000',
        price: 200000
    },
    '4': {
        name: 'Golden Snitch',
        image: [path.join(__dirname, 'src/database/tattoo_flash_04')],
        description: 'RM1,250',
        price: 125000
    },
    '5': {
        name: 'Star Path',
        image: [path.join(__dirname, 'src/database/tattoo_flash_05')],
        description: 'RM600',
        price: 60000
    },
    '6': {
        name: 'Water Breathing Style',
        image: [path.join(__dirname, 'src/database/tattoo_flash_06')],
        description: 'RM5,000',
        price: 500000
    },
    '7': {
        name: 'Valkyrie',
        image: [path.join(__dirname, 'src/database/tattoo_flash_07')],
        description: 'RM7,500',
        price: 750000
    },
    '8': {
        name: 'The Enchanted Rose',
        image: [path.join(__dirname, 'src/database/tattoo_flash_08')],
        description: 'RM1,000',
        price: 100000
    }
};

router.get('/init', async (req, res) => {
    try {
        res.send(TATTOO_FLASH);
    } catch (error) {
        notifyError(res, error, 504, 'Error');
    }
});

router.get('/stripe', (req, res) => {
    try {
        res.send(process.env.STRIPE_PUBLISHABLE_KEY);
    } catch (error) {
        notifyError(res, error, 504, 'Error');
    }
});

router.post('/stripe_payment', (req, res) => {
    console.log('stripe_payment');

    try {
        newForm(req, async (fields, files) => {
            // TODO: client side pass me product id, & based on product id retrieve from db.
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'myr',
                            product_data: {
                                name: 'Tattoo Name',
                                images: ['https://i.imgur.com/EHyR2nP.png']
                            },
                            unit_amount: 2000
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `http://localhost:3000/`,
                cancel_url: `http://localhost:3000/`
            });
            res.json({ id: session.id });
        });
    } catch (error) {
        notifyError(res, error, 504, 'Error');
    }
});

function notifyError(response, error, statusCode, message) {
    console.error(error);

    response.status(statusCode);
    response.send(message);
}

function newForm(req, callback) {
    const form = new multiparty.Form();
    form.parse(req, function(error, fields, files) {
        callback(fields, files);
    });
}

module.exports = router;