const menuToggleButtons = document.querySelectorAll('.menu-button');
const menuToggleButton = menuToggleButtons[0];
const closeMenuButton = menuToggleButtons[1];

const sidebar = document.querySelector('.sidebar');
const rootContainer = document.querySelector('#root');
const sidebarBackdrop = document.querySelector('.sidebar-backdrop');

const tagSearchContainer = document.querySelector('.tag-search-container');
const tagsScrollButton = tagSearchContainer.querySelector('button');

function openDrawerMenu() {
    if (window.innerWidth < 920) {
        sidebar.classList.add('small-screen');
        sidebar.querySelector('.top-logo-section').classList.remove('hide');
    }

    if (sidebar.classList.contains('small-screen')) {
        console.log('small-screen');
                
        sidebarBackdrop.classList.remove('hide');
    }
    sidebar.classList.add('expanded');
}

function closeDrawerMenu() {
    if (sidebar.classList.contains('small-screen')) {
        
        // sidebar.querySelector('.top-logo-section').classList.add('hide');
        sidebarBackdrop.classList.add('hide');
    }

    sidebar.classList.remove('expanded');
    
}

menuToggleButton.addEventListener('click', ()=> {
    if (sidebar.classList.contains('expanded')) {
        closeDrawerMenu();
    }
    else {
        openDrawerMenu();
    }
});
sidebarBackdrop.addEventListener('click', closeDrawerMenu);
closeMenuButton.addEventListener('click', closeDrawerMenu);


const accordionHeaderList = document.querySelectorAll('.accordion-header');

accordionHeaderList.forEach((accordionHeader)=> {
    
    accordionHeader.addEventListener('click', (event)=> {
        // if closed -> open
        const accordionHeader = event.target;
        const accordionTarget = event.target.previousElementSibling;

        if (accordionHeader.classList.contains('closed')) {
            
            accordionTarget.style.maxHeight = `${accordionTarget.scrollHeight}px`;
            accordionHeader.classList.remove('closed');
            accordionHeader.lastChild.textContent = 'Show Less';
        }
        else {
            accordionTarget.style.maxHeight = null;
            accordionHeader.classList.add('closed');
            accordionHeader.lastChild.textContent = 'Show More';
            
        }


    })
})

/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

function updateThumbnailClickEvents() {
    const mainPageThumbnails = document.querySelectorAll('.thumbnail-container');

    mainPageThumbnails.forEach((thumbnailContainer) => {
        thumbnailContainer.addEventListener('click', (event) => {

            console.log('clicked');
            const videoId = thumbnailContainer.getAttribute('data-id');
            sessionStorage.setItem('targetVideoId', videoId);

            window.location.href = 'video_player.html';
        })
    })
}

let home_searchInput;
let home_searchForm;

if (window.location.pathname === '/' || window.location.pathname === '/index.html') {

    home_searchForm = document.getElementById('search-query-form');
    home_searchInput = home_searchForm.search;
    
    home_searchForm.addEventListener('submit',(event)=> {
        event.preventDefault();
    
        // erase previous searched videos from screen
        const mainContainer = document.querySelector('.main-container');
        const thumbnailDisplaySection = mainContainer.querySelector('.thumbnail-display-section');
        
        const newThumbnailDisplaySection = document.createElement('div');
        newThumbnailDisplaySection.classList.add('thumbnail-display-section');
        
        thumbnailDisplaySection.replaceWith(newThumbnailDisplaySection);
    
    
        const searchQuery = home_searchInput.value;
        renderSearchResults(searchQuery).then((result)=> {
            updateThumbnailClickEvents();
            console.log(result)
            console.log('rendered new videos');
        })
    
        // if search originated from antother page, then mark activeSearch to be false again    
        // home_searchForm.reset();
        
    })
}


window.addEventListener('load', async (event)=> {
    
    // if not at home, abort
    if ((window.location.pathname !== '/index.html') && (window.location.pathname !== '/')) {
        console.log('oops', window.location.pathname);
        return;
    }

    // if at home, but navigated back with an active search, don't render sessionStorage videos
    if (sessionStorage.getItem('searchTrigger')) {
        home_searchInput.value = sessionStorage.getItem('searchTrigger');
        home_searchForm.requestSubmit();

        sessionStorage.removeItem('searchTrigger');
        return;
    }

    // if at home, and no active search

    const data = sessionStorage.getItem('renderableVideoProperties');    
    
    if (!data) {
        const doneRendering = await renderSearchResults('');
        console.log('rendered empty search query to home');
        updateThumbnailClickEvents();
    }
    else {
        console.log('fetching from session');
        const videoObjectsArray = JSON.parse(data);
        videoObjectsArray.forEach((video)=> {
            renderHomeVideo(video);
        })
        updateThumbnailClickEvents();
    }
})



const tagsList = document.querySelectorAll('.tag');
tagsList.forEach((tag)=> {

    tag.addEventListener('click',(event)=> {
        const prevActive = document.querySelector('.tag.selected');
        console.log(prevActive);
        prevActive.classList.remove('selected');

        event.target.classList.add('selected');
    })
})
