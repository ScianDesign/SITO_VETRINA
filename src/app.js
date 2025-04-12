async function loadPosts() {
    const response = await fetch('post.csv')
    const data = await response.text()
    
    const posts = data.split('\n').slice(1).map(row => {
        const [id, testo, immagine, perizia] = row.split(',')
        return { id, testo, immagine, perizia }
    })

    const container = document.getElementById('posts')
    container.innerHTML = posts.map(post => `
        <div class="bg-gray-800 p-6 rounded-lg">
            <img src="${post.immagine}" class="w-full h-48 object-cover mb-4">
            <p class="mb-4">${post.testo}</p>
            <a href="${post.perizia}" class="bg-amber-500 text-black px-4 py-2 rounded" target="_blank">
                Dettagli Perizia
            </a>
        </div>
    `).join('')
}

loadPosts()