/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const app = express();
const multiparty = require('multiparty');

const stripe = require('stripe')('sk_test_51IFfKhBc8V5oX29ceBZKl9ZDhzxtH7ufZa9wqIwQnHGuuja3YY5fcekmoM2OqwtgDP7EIHt0mV5nQvo2IG5tRDhM00JbFHK6n6');

const path = require('path');
const fs = require('fs');
const util = require('util');
const readFileP = util.promisify(fs.readFile);

let TATTOO_FLASH = undefined;
const DATABASE_PATH = path.join(__dirname, 'src/database');

app.use(express.static('public'));

app.get('/init', async (req, res) => {
    try {
        // NOTE: temp fake database
        const tattooFlashBuffer01 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_01.jpg'));
        const tattooFlashBuffer02 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_02.jpg'));
        const tattooFlashBuffer03 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_03.jpg'));
        const tattooFlashBuffer04 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_04.jpg'));
        const tattooFlashBuffer05 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_05.jpg'));
        const tattooFlashBuffer06 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_06.jpg'));
        const tattooFlashBuffer07 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_07.jpg'));
        const tattooFlashBuffer08 = await readFileP(path.join(DATABASE_PATH, 'tattoo_flash_08.jpg'));

        TATTOO_FLASH = {
            '0': {
                name: 'Maple Story',
                image: [tattooFlashBuffer01],
                description: 'RM500',
                price: 50000
            },
            '1': {
                name: 'Skeleton King',
                image: [tattooFlashBuffer02],
                description: 'RM12,500',
                price: 1250000
            },
            '2': {
                name: 'Super Mario',
                image: [tattooFlashBuffer03],
                description: 'RM2,000',
                price: 200000
            },
            '3': {
                name: 'Golden Snitch',
                image: [tattooFlashBuffer04],
                description: 'RM1,250',
                price: 125000
            },
            '4': {
                name: 'Star Path',
                image: [tattooFlashBuffer05],
                description: 'RM600',
                price: 60000
            },
            '5': {
                name: 'Water Breathing Style',
                image: [tattooFlashBuffer06],
                description: 'RM5,000',
                price: 500000
            },
            '6': {
                name: 'Valkyrie',
                image: [tattooFlashBuffer07],
                description: 'RM7,500',
                price: 750000
            },
            '7': {
                name: 'The Enchanted Rose',
                image: [tattooFlashBuffer08],
                description: 'RM1,000',
                price: 100000
            }
        };

        res.send(TATTOO_FLASH);
    } catch (error) {
        notifyError(res, error, 504, 'Error');
    }
});

app.get('/stripe', (req, res) => {
    try {
        res.send('pk_test_51IFfKhBc8V5oX29cDEJVWH54o5gtH6U07fxj0ysK1Drq1Zq1yzdG9fRgsrd2X7EyLsgp5XhrcmXvpb6sMXhHSpuz00xAAiOENt');
    } catch (error) {
        notifyError(res, error, 504, 'Error');
    }
});

app.post('/stripe_payment', (req, res) => {
    try {
        newForm(req, async (fields, files) => {
            // TODO: client side pass me product id, & based on product id retrieve from db.
            const tattooFlash = TATTOO_FLASH[fields.tf];

            // NOTE: blob is for local only, hence stripe images url can't be blob.
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'myr',
                            product_data: {
                                name: tattooFlash.name,
                                images: ['https://i.imgur.com/EHyR2nP.png']
                            },
                            unit_amount: tattooFlash.price
                        },
                        quantity: 1
                    }
                ],
                mode: 'payment',
                success_url: `https://clpedia.herokuapp.com/`,
                cancel_url: `https://clpedia.herokuapp.com/`
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`CLPEDIA HOSTED: ${port}`);
});
