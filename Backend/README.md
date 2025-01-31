# SearchEngine

A small scale search engine. The crawler is done using puppeteer cluster on top of chromium. The crawler will crawl the list of websites following the permissions provided in the robots.txt file in each url. The content will be extracted and then indexed in cosmos db.