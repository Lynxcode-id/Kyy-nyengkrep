/**
 * ───「 AUTHOR SCRAPE 」───
 * 👤 Author     : Lynx - Inf project team
 * 📞 Contact    : +62 882-5804-1396
 * 📢 Channel    : https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i
 * ⚠️ Note : Di kasih gratis jangan ngehapus wm sadar diri pakcik 😹
 * ─────────────────────────
 * 📝 Note : support slide - video sup hd - non hd itu ajah sih
*/

const axios = require('axios');
const readline = require('readline');

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Android 14; Mobile; rv:153.0) Gecko/153.0 Firefox/153.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
];

async function scrapeInstagram(igUrl) {
    try {
        const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
        
        const response = await axios.post('https://snapdownloader.app/api/ajaxSearch',
            `recaptchaToken=&q=${encodeURIComponent(igUrl)}&t=media&lang=id&v=v2`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': '*/*',
                    'Origin': 'https://snapdownloader.app',
                    'Referer': 'https://snapdownloader.app/id',
                    'User-Agent': randomUA,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                timeout: 15000
            }
        );

        if (!response.data || !response.data.data) {
            throw new Error('No data received');
        }

        const packedData = response.data.data;
        const unpacker = new Function(packedData.replace('eval(', 'return ('));
        const unpackedJs = unpacker();

        const downloads = [];
        const regex = /href=\\?["'](https?:\/\/[^"'\\]+)\\?["']/g;
        let match;
        
        while ((match = regex.exec(unpackedJs)) !== null) {
            const url = match[1];
            
            if (url.includes('dl.snapcdn.app')) {
                let type = 'Media';
                try {
                    const token = url.split('token=')[1];
                    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                    type = payload.filename && payload.filename.endsWith('.mp4') ? 'Video' : 'Image';
                } catch (e) {
                    type = 'Media';
                }
                downloads.push({ type, url });
            }
        }

        if (downloads.length === 0) throw new Error('Media tidak ditemukan');

        return {
            status: 'success',
            downloads: [...new Map(downloads.map(item => [item.url, item])).values()]
        };

    } catch (err) {
        return { 
            status: 'failed', 
            error: err.response ? `HTTP ${err.response.status}` : err.message 
        };
    }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Masukkan link IG: ', async (link) => {
    const res = await scrapeInstagram(link);
    console.log('\n======================================');
    console.log(JSON.stringify(res, null, 2));
    console.log('======================================\n');
    rl.close();
});