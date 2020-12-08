import puppeteer, { Browser } from "puppeteer";

export class PuppeteerClient {
    private static mInstance: PuppeteerClient;
    private static browser: Browser;
    private static page: puppeteer.Page;

    constructor() { }

    public static getInstance(): PuppeteerClient {
        this.initPage().then(() => {
            if (!this.mInstance)
                this.mInstance = new PuppeteerClient();
        })
        return this.mInstance;
    }

    static async initPage(width?: number, height?: number) {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]
        });
        this.page = await this.browser.newPage();
        
        const viewportOptions = {
            "width": Number(width) || 1280,
            "height": Number(height) || 800,
            "deviceScaleFactor": 1,
        }
        
        console.log("[PuppeteerClient] Creating new page with options: ", viewportOptions);

        await this.page.setViewport(viewportOptions);

        return this.page;
    }

    static async doScreenshot(url: string): Promise<string> {
        console.log("[PuppeteerClient] Capturing screenshot of url: ", url);

        const filename = `Screenshot-${Date.now()}.png`;
        const screenshotOptions = {
            path: `./screenshots/${filename}`
        };

        await this.page.goto(url);
        await this.page.screenshot(screenshotOptions);

        return filename;
    }
}