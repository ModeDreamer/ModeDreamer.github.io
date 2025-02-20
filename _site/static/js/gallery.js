// Configuration for the gallery sections with video folders
const galleryConfig = {
    'isd_bunny': {
        title: 'Bunny Generation Results',
        folder: 'isd_bunny'  // Simplified path
    },
    'isd_multi': {
        title: 'Multi-Object Generation Results',
        folder: 'isd_multi'  // Simplified path
    },
    'isd_single': {
        title: 'Single Object Generation Results',
        folder: 'isd_single'  // Simplified path
    },
    'isd_surr': {
        title: 'Objects with Surrounding Context',
        folder: 'isd_surr'  // Simplified path
    }
};

// Keep track of loaded videos and pagination
let loadedVideos = new Set();
let currentPage = 1;
const videosPerPage = 10;
let allVideoFiles = [];

// Function to create a video box element with lazy loading
function createVideoBox(video) {
    const formattedTitle = video.title
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/,/g, ', ')
        .trim();
    
    const videoPath = 'static/' + video.path;
    console.log('Creating video box for:', videoPath);
    
    return `
        <div class="column is-6 mb-4">
            <div class="box video-box">
                <h4 class="subtitle is-5 has-text-centered">${formattedTitle}</h4>
                <div class="video-container">
                    <div class="video-wrapper">
                        <video 
                            autoplay 
                            muted 
                            loop 
                            playsinline
                            preload="metadata"
                            class="has-ratio" 
                            data-src="${videoPath}"
                            onloadstart="this.parentElement.classList.add('loading')"
                            oncanplay="this.parentElement.classList.remove('loading'); this.style.height = 'auto'; this.parentElement.style.height = 'auto'; this.play();"
                            onerror="console.error('Video failed to load:', this.dataset.src); this.parentElement.innerHTML = '<div class=\\'notification is-danger\\'>Failed to load video</div>'"
                        >
                            <source data-src="${videoPath}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to create gallery content
function createGalleryContent(title) {
    return `
        <div class="content">
            <h3 class="title is-4 has-text-centered mb-5">${title}</h3>
            <div class="columns is-multiline is-variable is-4" id="video-container">
                <div class="column is-12 loading-indicator">
                    <progress class="progress is-primary" max="100">Loading...</progress>
                </div>
            </div>
            <div class="has-text-centered mt-6" id="load-more-container" style="display: none;">
                <button class="button is-primary is-medium" id="load-more-btn">
                    Show More
                </button>
            </div>
        </div>
    `;
}

// Function to load more videos
function loadMoreVideos() {
    const container = document.getElementById('video-container');
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = Math.min(startIndex + videosPerPage, allVideoFiles.length);
    
    // Add next batch of videos
    for (let i = startIndex; i < endIndex; i++) {
        const video = allVideoFiles[i];
        const videoBox = createVideoBox(video);
        container.insertAdjacentHTML('beforeend', videoBox);
    }
    
    // Observe new videos for lazy loading
    container.querySelectorAll('video:not([src])').forEach(video => {
        videoObserver.observe(video);
    });
    
    // Update page counter
    currentPage++;
    
    // Hide "Show More" button if no more videos
    const loadMoreContainer = document.getElementById('load-more-container');
    if (endIndex >= allVideoFiles.length) {
        loadMoreContainer.style.display = 'none';
    }
}

// Function to get list of videos in a directory
async function fetchDirectoryListing(folder) {
    try {
        // Extract folder name from the path
        const folderName = folder.split('/').pop();
        console.log('Fetching videos for folder:', folderName);
        
        const response = await fetch(`list_videos.php?folder=${folderName}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch video list: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received video data:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown error occurred');
        }
        
        // Map the videos to ensure paths are correct
        return (data.videos || []).map(video => ({
            ...video,
            path: video.path.replace(/^static\//, '')  // Remove 'static/' from the beginning if present
        }));
    } catch (error) {
        console.error('Error fetching directory listing:', error);
        throw error;  // Re-throw to handle in the calling function
    }
}

// Intersection Observer for lazy loading
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const video = entry.target;
            const source = video.querySelector('source');
            
            if (!video.src && source.dataset.src) {
                video.src = source.dataset.src;
                source.src = source.dataset.src;
                video.load();
                video.play();  // Start playing when video becomes visible
                
                video.onerror = () => {
                    video.parentElement.classList.remove('loading');
                    video.parentElement.classList.add('error');
                    video.parentElement.innerHTML = `
                        <div class="notification is-danger">
                            Failed to load video
                        </div>
                    `;
                };
            }
            
            videoObserver.unobserve(video);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '50px'
});

// Keep track of current section
let currentSection = '';

// Function to load videos for a section
async function loadVideosForSection(sectionKey) {
    currentSection = sectionKey;
    currentPage = 1;
    const config = galleryConfig[sectionKey];
    const galleryContent = document.getElementById('gallery-content');
    
    console.log('Loading videos for section:', sectionKey);
    console.log('Using folder:', config.folder);
    
    // Clear previous content and show loading state
    galleryContent.innerHTML = createGalleryContent(config.title);
    
    const container = document.getElementById('video-container');
    if (!container) return;

    try {
        // Remove loading indicator
        container.innerHTML = '';

        // Get list of videos in the directory
        allVideoFiles = await fetchDirectoryListing(config.folder);
        console.log('Found videos:', allVideoFiles);

        if (allVideoFiles.length === 0) {
            container.innerHTML = `
                <div class="column is-12">
                    <div class="notification is-warning">
                        No videos found in ${config.title}. Make sure your web server is running and the video files exist in the correct folder.
                    </div>
                </div>
            `;
            return;
        }

        // Load first batch of videos
        loadMoreVideos();
        
        // Show "Show More" button if there are more videos
        const loadMoreContainer = document.getElementById('load-more-container');
        if (allVideoFiles.length > videosPerPage) {
            loadMoreContainer.style.display = 'block';
            document.getElementById('load-more-btn').addEventListener('click', loadMoreVideos);
        }

    } catch (error) {
        console.error(`Error loading videos for ${sectionKey}:`, error);
        container.innerHTML = `
            <div class="column is-12">
                <div class="notification is-danger">
                    Error loading videos: ${error.message}. Please make sure your web server is running and PHP is enabled.
                </div>
            </div>
        `;
    }
}

// Function to handle button clicks
function handleFolderButtonClick(event) {
    const button = event.target;
    if (!button.matches('.folder-buttons .button')) return;
    
    // Update active button state
    document.querySelectorAll('.folder-buttons .button').forEach(btn => {
        btn.classList.remove('is-active');
    });
    button.classList.add('is-active');
    
    // Load videos for selected folder
    const folderKey = button.dataset.folder;
    loadVideosForSection(folderKey);
}

// Initialize the gallery
function initGallery() {
    const galleryContainer = document.getElementById('results-gallery');
    if (!galleryContainer) return;

    // Add click event listener for folder buttons
    galleryContainer.addEventListener('click', handleFolderButtonClick);
    
    // Load first folder by default
    const firstButton = galleryContainer.querySelector('.folder-buttons .button');
    if (firstButton) {
        firstButton.classList.add('is-active');
        loadVideosForSection(firstButton.dataset.folder);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGallery);

// Add CSS styles for the video layout
const style = document.createElement('style');
style.textContent = `
    .video-box {
        display: flex;
        flex-direction: column;
        transition: transform 0.2s ease;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        background: white;
        margin: 0;
        padding: 0;
    }
    
    .video-container {
        position: relative;
        width: 100%;
        background: #000;
        border-radius: 4px;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }
    
    .video-wrapper {
        position: relative;
        width: 100%;
        background: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0;
        padding: 0;
    }
    
    .video-wrapper video {
        width: 100%;
        display: block;
        object-fit: cover;
        margin: 0;
        padding: 0;
    }
    
    @media screen and (max-width: 768px) {
        .column.is-6 {
            padding: 0.5rem;
        }
    }
`;
document.head.appendChild(style); 