async function searchToUrl(query) {
    const url = 'https://google-api-unlimited.p.rapidapi.com/yt_search';
    const data = new FormData();
    data.append('query', query);
    data.append('max_results', '1');

    const options = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': 'd5dc78002dmsha21b667e587ff64p1e234fjsnb10724403a00',
            'x-rapidapi-host': 'google-api-unlimited.p.rapidapi.com'
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