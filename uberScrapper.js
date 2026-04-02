import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function main() {
    let k = 0;
    let baseUrl = 'https://www.datadoghq.com/blog/search/?blog-0=Engineering';
    let response = await axios.get(baseUrl);
    // console.log(response);
    
    let $ = cheerio.load(response.data);
    console.log($('body').html());
    
    // // latest post  
    // let lp = $('[data-testid=newsroom-article-feed-grid]');
    // console.log("lp", lp[0]);
    
   
}

main();
