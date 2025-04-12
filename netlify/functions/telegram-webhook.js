const axios = require('axios')
const { Octokit } = require("@octokit/rest")

exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    const message = body.channel_post

    if (!message || !message.caption) return { statusCode: 200 }

    try {
        // 1. Prendi l'immagine
        const photo = message.photo[message.photo.length - 1]
        const fileRes = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getFile?file_id=${photo.file_id}`)
        const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${fileRes.data.result.file_path}`

        // 2. Parsing testo
        const [testo, driveLink] = message.caption.split('|DRIVE|')

        // 3. Aggiorna CSV
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
        const newRow = `${Date.now()},"${testo.trim()}","${imageUrl}","${driveLink?.trim() || ''}"\n`

        await octokit.repos.createOrUpdateFileContents({
            owner: 'TUO_USERNAME_GITHUB',
            repo: 'NOME_REPO',
            path: 'post.csv',
            message: 'Update from Telegram',
            content: Buffer.from(newRow).toString('base64'),
            sha: await getFileSha()
        })

        return { statusCode: 200 }
    } catch (err) {
        return { statusCode: 500, body: err.toString() }
    }
}

async function getFileSha() {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    try {
        const { data } = await octokit.repos.getContent({
            owner: 'TUO_USERNAME_GITHUB',
            repo: 'NOME_REPO',
            path: 'post.csv'
        })
        return data.sha
    } catch {
        return null
    }
}