/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const app = express();

const routes = require('./routes');

/* eslint-disable @typescript-eslint/no-use-before-define */
const yargs = require('yargs');
const argv = yargs
    .option('port', {
        number: true,
        alias: 'p',
        default: 3000,
        demandOption: false
    })
    .help()
    .usage('node $0 [argv]')
    .epilog('Author Email: how_choon_loong@hotmail.com').argv;

function hostServer(argv) {
    app.use(express.static('public'));
    app.use('/', routes);

    app.listen(process.env.PORT || 3000);

    // const port = argv.port;
    // app.listen(port, async () => {
    //     console.log(`CLPEDIA Server Running At Port: ${port}\n`);
    // });
}
hostServer(argv);
