/*  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  */
/*                             HTML ELEMENTS INTERACTION                 */

function updateThumbnailClickEvents() {
    const mainPageThumbnails = document.querySelectorAll('.thumbnail-container');

    mainPageThumbnails.forEach((thumbnailContainer) => {
        thumbnailContainer.addEventListener('click', (event) => {

            console.log('clicked');
            const videoId = thumbnailContainer.getAttribute('data-id');
            localStorage.setItem('targetVideoId', videoId);

            window.location.href = 'video_player.html';
        })
    })
}

const homeSearchFrom = document.getElementById('search-query-form');

homeSearchFrom.addEventListener('submit',(event)=> {
    event.preventDefault();

    const searchQuery = homeSearchFrom.search.value;

    // erase previous searched videos from screen
    const mainContainer = document.querySelector('.main-container');
    const thumbnailDisplaySection = mainContainer.querySelector('.thumbnail-display-section');
    
    const newThumbnailDisplaySection = document.createElement('div');
    newThumbnailDisplaySection.classList.add('thumbnail-display-section');
    
    thumbnailDisplaySection.replaceWith(newThumbnailDisplaySection);



    renderSearchResults(searchQuery).then((result)=> {
        updateThumbnailClickEvents();
        console.log('rendered new videos');
    })

    homeSearchFrom.reset();
    
})

window.addEventListener('load', (event)=> {
    const data = localStorage.getItem('renderableVideoProperties');
    
    
    if (!data) {
        renderSearchResults('');
    }
    else {
        console.log('fetching from local');
        const videoObjectsArray = JSON.parse(data);
        videoObjectsArray.forEach((video)=> {
            renderHomeVideo(video);
        })
        updateThumbnailClickEvents();
    }
})