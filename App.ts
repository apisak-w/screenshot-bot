import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";

import { PuppeteerClient } from './Components/PuppeteerClient';

export class App {
    private static app: express.Application = express();
    static init() {
        require('dotenv').config();

        const port: number = Number(process.env.PORT) || 3000;

        this.app.use(bodyParser.json({ limit: '500mb' }));
        this.app.use(bodyParser.urlencoded({ extended: false, limit: '500mb' }));

        this.app.use((req: Request, res: Response, next) => {
            if (process.env.DOMAIN_ALLOW_ORIGIN) {
                res.header('Access-Control-Allow-Origin', process.env.DOMAIN_ALLOW_ORIGIN);
            }
            res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.app.use('/screenshot', express.static(path.join(__dirname, 'screenshots')));

        this.app.listen(port, async () => {
            await PuppeteerClient.initPage();
            console.log("App is now running on port " + port);
        });

        this.bindRouters();
    }

    private static bindRouters() {
        this.app.post('/screenshot', async (req: Request, res: Response) => {
            if (!req.body.hasOwnProperty("url") || !req.body.url) {
                res.send({ "status": "error", "message": "url parameter is required and can't be empty" })
            } else {
                const { url, width, height } = req.body;
                const host = `${req.protocol}://${req.get('host')}`;

                await PuppeteerClient.initPage(width, height);
                const screenshotUrl = await PuppeteerClient.doScreenshot(url);

                res.send({ "status": "success", "url": `${host}/screenshot/${screenshotUrl}` })
            }
        });
    }
}

App.init();