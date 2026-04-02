import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function main() {
    let k = 0;
    let baseUrl = 'https://engineering.grab.com';
    let response = await axios.get(baseUrl);
    
    let $ = cheerio.load(response.data);

    // latest post 
    let $lp = $('.post-list').find('.latest-post');
    let imgSrc = $lp.find('img').attr('src');
    let title = $lp.find('.post-title').text().trim();
    let content = $lp.find('.post-content').text().substring(0, 100).trim() + "...";
    let url = $lp.find('.post-title').attr('href');
    let date = $lp.find('.post-date').text().trim();
    fs.appendFileSync('content/grab-content.txt',title + ";" + content + ";" + baseUrl + url + ";" + baseUrl + imgSrc + ";" + date + "\n");

    let postList = $('.post-list').find('li');

    for(let i = 0; i < postList.length; i++) {
        let $li = $(postList[i]);
        let imgSrc = $li.find('img').attr('src');
        let title = $li.find('.post-title-small').text().trim();
        let content = $li.find('.post-content').text().substring(0, 100).trim() + "...";
        let url = $li.find('.post-title-small').attr('href');
        let date = $li.find('.post-date').text().trim();

        fs.appendFileSync('content/grab-content.txt',title + ";" + content + ";" + baseUrl + url + ";" + baseUrl + imgSrc + ";" + date + "\n");
    }

    let maxPage = 100;
    let page = 1;
    while (page <= maxPage) {
        let nextPageUrl = baseUrl + '/blog/' + (page + 1);
        let nextPageResponse = await axios.get(nextPageUrl);
        let $ = cheerio.load(nextPageResponse.data);
        let postList = $('.post-list').find('li');
        for (let i = 0; i < postList.length; i++) {
            let $li = $(postList[i]);
            let imgSrc = $li.find('img').attr('src');
            let title = $li.find('.post-title-small').text().trim();
            let content = $li.find('.post-content').text().substring(0, 100).trim() + "...";
            let url = $li.find('.post-title-small').attr('href');
            let date = $li.find('.post-date').text().trim();

            fs.appendFileSync('content/grab-content.txt',title + ";" + content + ";" + baseUrl + url + ";" + baseUrl + imgSrc + ";" + date + "\n");
        }
        page++;
    }   
}

main();
