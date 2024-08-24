require("dotenv").config();

async function searchToUrl(query) {
    const url = 'https://google-api-unlimited.p.rapidapi.com/yt_search';
    const data = new FormData();
    data.append('query', query);
    data.append('max_results', '1');

    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': process.env.API_SEARCH_KEY,
            'x-rapidapi-host': process.env.API_SEARCH_HOST
        },
        body: data
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(result)
        return result.result[0].link
    } catch (error) {
        console.error(error);
    }
}

module.exports = { searchToUrl }