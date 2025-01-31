# Crawler

The crawler uses [puppeteer](https://github.com/thomasdondorf/puppeteer-cluster) cluster , a nodejs library to run and manage clusters of chromium headless browser.

### Install puppeteer cluster and other dependencies:


```bash
npm install --save puppeteer # in case you don't already have it installed 
npm install --save puppeteer-cluster
npm install csv-parser robots-parser
```

### Crawl using list of urls:

To crawl the websites use a csv file that contains the list of urls to be crawled. The result is stored in a folder named as the url. The folder contains two files, a raw html content and a text content. If the crawler fails in between , it will resume from the websites it has already crawled.


### Concurrency in puppeteer cluster:

There are three main concurrency types available in puppeteer cluster.

1. `CONCURRENCY_PAGE`
2. `CONCURRENCY_CONTEXT`
3. `CONCURRENCY_BROWSER`

### Robots.txt 

Each and every website will have a `robots.txt` file. Robots.txt file is a plain text file that tells search engine crawlers which URLs a website allows them to access. `robots-txt` parser is used to parser the `robots.txt` file in each website and decide whether crawl the website or not.

### Timeout:

The chromium has a default timeout option. If the browser is not able to load the contents within the specified timeout, then it will be considered as a failure and the crawler will move to the next website.