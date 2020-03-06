const { URL } = require('url'); // <------ This is new.
const Apify = require('apify');

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: 'https://apify.com' });

    const handlePageFunction = async ({ request, $ }) => {
        const title = $('title').text();
        console.log(`The title of "${request.url}" is: ${title}.`);

        // Here starts the new part of handlePageFunction.
        const links = $('a[href]')
            .map((i, el) => $(el).attr('href'))
            .get();

        const ourDomain = 'https://apify.com';
        const absoluteUrls = links.map(link => new URL(link, ourDomain));

        const sameDomainLinks = absoluteUrls.filter(url => url.href.startsWith(ourDomain));

        console.log(`Enqueueing ${sameDomainLinks.length} URLs.`);
        for (const url of sameDomainLinks) {
            await requestQueue.addRequest({ url: url.href });
        }
    };

    const crawler = new Apify.CheerioCrawler({
        maxRequestsPerCrawl: 20, // <------ This is new too.
        requestQueue,
        handlePageFunction,
    });

    await crawler.run();
});