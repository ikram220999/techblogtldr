import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function main() {
    let k = 0;
    let baseUrl = 'https://airbnb.tech/blog/';
    let response = await axios.get(baseUrl);
    
    let $ = cheerio.load(response.data);
    let articles = $('.article-list article');
    
    for (let i = 0; i < articles.length; i++) {
        let $article = $(articles[i]);
        let title = $article.find('.copy h3 span').text().trim();
        let description = $article.find('.copy p').text().trim();
        let url = $article.find('.copy a').attr('href');
        let imgSrc = $article.find('img').attr('src');
        let date = ""; // No date available in the provided structure
        
        fs.appendFileSync('public/content/airbnb-content.txt', title + ";" + description + ";" + url + ";" + imgSrc + ";" + date + "\n");
    }
    console.log("Airbnb scraping completed.");
}

main();
