
const {Cluster} = require('puppeteer-cluster');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const RobotsParser = require('robots-parser');

const csvFilePath = path.join(__dirname, 'urls.csv');

const resultsFolder = path.join(process.cwd(), 'results_folder');

// create a folder to store the results
if(!fs.existsSync(resultsFolder)){
    fs.mkdirSync(resultsFolder);
}

(async () => {
        // launching the cluster
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT, 
            maxConcurrency : 4,
            monitor:true, 
        });

       // function to crawl and save the website
        const crawl = async({page,data:domain}) => {
                
            if (!domain) {
              console.error('Malformed row in CSV: Missing domain');
              return;
            }
          
            const domainWithProtocol = `https://${domain}`;
            const domainName = domain;
            if (!domainName) {
              console.error(`Invalid domain: ${domain}`);
              return;
            }
          
            const folderName = path.join(resultsFolder, domainName);
            
            if(!fs.existsSync(folderName))
            {
                try {
                
                    page.setDefaultTimeout(15000);
                    
                    const robotsTxtUrl = `${domainWithProtocol}/robots.txt`;
                    const response = await fetch(robotsTxtUrl);
                    const robotsTxtContent = await response.text();
                    
                    const robotsTxtParser = new RobotsParser(robotsTxtUrl, robotsTxtContent);
                    const isAllowed = robotsTxtParser.isAllowed(domainWithProtocol);
                    
                    if (isAllowed) 
                    {
                        
                        await page.goto(domainWithProtocol);
                    
                        const htmlContent = await page.content();
                        
                        if(htmlContent){
                          if (!fs.existsSync(folderName)) {
                              fs.mkdirSync(folderName);
                          }
                          fs.writeFileSync(path.join(folderName, `${domainName}.html`), htmlContent);
                        }
                    
                    } 
                    else 
                    {
                        
                    }
              
                } catch (error) {
                  console.error(`Error crawling ${domain}:`, error);
                }
            }
            else
            {
                console.log('already crawler');
            }
        }
        
        fs.createReadStream(csvFilePath)
            .pipe(csv(['Rank', 'Domain']))
            .on('data', (row) => {
                const rank = parseInt(row.Rank);
                const domain = row.Domain;
		const folderName =  path.join(resultsFolder, domain);
		if(!fs.existsSync(folderName)){
                cluster.queue(domain, crawl);
		}
            });

        await cluster.idle();
        await cluster.close();

})();

