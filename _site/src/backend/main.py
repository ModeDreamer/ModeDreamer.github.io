// Function to load and display results for a specific folder
function loadResults(folder, button) {
    console.log(`Loading results for: ${folder}`); // Debug log
    const basePath = 'static/outputs_isd_new/';
    const folderPath = `${basePath}${folder}/`;
    const resultsContainer = document.getElementById('results-container');
    
    // Clear previous results
    resultsContainer.innerHTML = '';

    // Reset button styles
    resetButtonStyles();

    // Highlight the selected button
    button.classList.add('is-active');
    console.log(`Button selected: ${button.innerText}`); // Debug log

    // Fetch the list of .mp4 files in the selected folder
    fetch(folderPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, 'text/html');
            const videoFiles = Array.from(htmlDoc.querySelectorAll('a'))
                .map(link => link.getAttribute('href'))
                .filter(href => href.endsWith('.mp4'));

            console.log(videoFiles); // Log the fetched video files

            videoFiles.forEach(file => {
                const prompt = file.replace('.mp4', '').replace(/_/g, ' '); // Convert filename to prompt
                const videoElement = document.createElement('div');
                videoElement.className = 'column is-one-third has-text-centered';
                videoElement.innerHTML = `
                    <video data-src="${folderPath}${file}" controls muted loop playsinline>
                        Your browser does not support the video tag.
                    </video>
                    <p>${prompt}</p>
                `;
                
                console.log(videoElement); // Log the created video element

                // Error handling for video loading
                const video = videoElement.querySelector('video');
                video.onerror = () => {
                    console.error(`Error loading video: ${folderPath}${file}`);
                };

                resultsContainer.appendChild(videoElement);
            });

            // Lazy load videos
            lazyLoadVideos();
        })
        .catch(error => console.error('Error loading videos:', error));
}

// Function to reset button styles
function resetButtonStyles() {
    const buttons = document.querySelectorAll('.navbar-item');
    buttons.forEach(button => {
        button.classList.remove('is-active');
    });
}

// Function to lazy load videos
function lazyLoadVideos() {
    const videos = document.querySelectorAll('video[data-src]');
    videos.forEach(video => {
        video.src = video.getAttribute('data-src');
        video.removeAttribute('data-src');
    });
} 