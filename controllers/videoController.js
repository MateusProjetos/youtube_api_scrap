const puppeteer = require('puppeteer');
const ytdl = require('ytdl-core');
const { format } = require('date-fns');

let browser;

async function initBrowser() {
    browser = await puppeteer.launch({ headless: true });
    console.log('Browser instance created');
}

async function closeBrowser() {
    if (browser) {
        await browser.close();
        console.log('Browser instance closed');
    }
}

module.exports = () => {
    const scrapeVideos = async (req, res) => {
        const { nome_do_canal } = req.body;
        const limit = parseInt(req.query.limit) || 10;

        if (!nome_do_canal) {
            return res.status(400).json({ error: 'nome_do_canal is required' });
        }

        if (limit > 50) {
            return res.status(400).json({ error: 'Limit cannot be greater than 50' });
        }

        const url = `https://www.viewstats.com/${nome_do_canal}/videos`;

        try {
            if (!browser) {
                await initBrowser();
            }

            const page = await browser.newPage();
            console.log(`Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle0' });

            const videos = await page.evaluate((limit) => {
                const videoElements = Array.from(document.querySelectorAll('.videos-grid a'));
                return videoElements.slice(0, limit).map(el => ({
                    title: el.querySelector('.title').textContent.trim(),
                    link: el.href
                }));
            }, limit);

            await page.close();

            console.log(`Scraped ${videos.length} videos`);

            // Adicionar data e descrição usando ytdl-core
            for (const video of videos) {
                const videoId = video.link.split('/').pop();
                console.log(`Processing video ID: ${videoId}`);
                try {
                    const videoInfo = await ytdl.getInfo(videoId);
                    const publishDate = new Date(videoInfo.videoDetails.publishDate);
                    video.date = format(publishDate, 'dd/MM/yyyy');
                    video.description = videoInfo.videoDetails.description;
                    video.link = `https://www.youtube.com/watch?v=${videoId}`
                    
                } catch (ytdlError) {
                    console.error(`Error retrieving video info for ${videoId}:`, ytdlError.message);
                    video.date = 'Unknown';
                    video.description = 'Description unavailable';
                }
            }

            res.status(200).json(videos);
        } catch (error) {
            console.error('Error in scrapeVideos:', error);
            res.status(500).json({ error: 'An error occurred while scraping the videos' });
        }
    };

    return { scrapeVideos, initBrowser, closeBrowser };
};
