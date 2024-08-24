function convertYouTubeURL(url) {
    // Trova l'indice in cui inizia "youtube"
    const youtubeIndex = url.indexOf('youtube');

    // Se "youtube" non è presente nell'URL, ritorna null o un messaggio di errore
    if (youtubeIndex === -1) {
        return null; // O un messaggio di errore: return "URL non valido";
    }

    // Mantieni solo la parte dell'URL che inizia con "youtube"
    let cleanUrl = url.substring(youtubeIndex);

    // Rimuovi tutto dopo e incluso il carattere '%'
    const percentIndex = cleanUrl.indexOf('%');
    if (percentIndex !== -1) {
        cleanUrl = cleanUrl.substring(0, percentIndex);
    }

    // Aggiungi "youtube.com" all'inizio se necessario
    if (!cleanUrl.startsWith('youtube.com')) {
        cleanUrl = 'youtube.com/' + cleanUrl.substring(cleanUrl.indexOf('/') + 1);
    }

    return cleanUrl;
}
module.exports = { convertYouTubeURL }