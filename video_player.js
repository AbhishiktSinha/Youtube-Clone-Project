const targetVideoId = sessionStorage.getItem('targetVideoId');
const videoObjectsArray = JSON.parse(sessionStorage.getItem('renderableVideoProperties'));
const videoObject = videoObjectsArray.find((item)=> {
    return (item.videoId.localeCompare(targetVideoId) === 0);
})

const videoPlayerContainer = document.getElementById('video_player_container');

function renderVideoPlayer () {

    displayVideoIframe();

    renderVideoSection();

    renderCommentSection();

    renderRecommendedVideos()
}

function renderVideoSection() {
    const videoDataContainer = document.querySelector('.video-data-container');
    
    videoDataContainer.querySelector('.video-title').innerHTML = videoObject.videoTitle;

    const videoStatsContainer = videoDataContainer.querySelector('.video-stats');
        videoStatsContainer.firstElementChild.textContent = `${videoObject.videoViewCount} Views`;
        videoStatsContainer.lastElementChild.textContent = `${videoObject.sincePublishDate}`;

    const videoActionContainer = videoDataContainer.querySelector('.video-actions');
        videoActionContainer.querySelector('button').appendChild(document.createTextNode(videoObject.likeCount));

    const channelLogoContainer = videoDataContainer.querySelector('.creator-logo-container');
        channelLogoContainer.querySelector('img').src = videoObject.channelLogoUrl;
    

    videoDataContainer.querySelector('.channel-name').textContent = videoObject.channelTitle;
    videoDataContainer.querySelector('.channel-subscriber-count').textContent = videoObject.channelSubscriberCount + ' Subscribers';


    videoDataContainer.querySelector('.video-description-text-container').textContent = videoObject.videoDescription;
}

async function renderCommentSection () {

    // update comment count
    const commentCount = videoObject.commentCount;
    document.querySelector('#comment-count').textContent = commentCount;

    const loadedCommentsSection = document.querySelector('.loaded-comments-section');

    
    const commentDetailsArray = await fetchComments(targetVideoId);

    // create and render comment elements using commentDetails objects
    commentDetailsArray.forEach((commentDetailsObject)=> {
        const commentElement = createNewComment(commentDetailsObject);

        loadedCommentsSection.appendChild(commentElement);

        addReadMoreButton(commentElement);
        
    });

    function addReadMoreButton(newComment) {
        const commentTextContainer = newComment.querySelector('.comment-text-container');
        const commentContentContainer = commentTextContainer.parentElement;
    
        if (commentTextContainer.clientHeight < commentTextContainer.scrollHeight) {
            const readMoreLess = document.createElement('span');
            readMoreLess.classList.add('expand-comment-toggle');
            readMoreLess.textContent = 'Read more';
    
            commentContentContainer.appendChild(readMoreLess);
            console.log(readMoreLess);
    
            readMoreLess.addEventListener('click', (event)=> {

                event.stopPropagation();
            
                console.log('clicked readmore');

                const expandCommentToggleButton = readMoreLess;
                const targetComment = expandCommentToggleButton.previousElementSibling;
    
                if (targetComment.classList.contains('comment-collapsed')) {
                    expandCommentToggleButton.textContent = 'Read less';
                    targetComment.classList.remove('comment-collapsed');
                }
                else {
                    expandCommentToggleButton.textContent = 'Read more';
                    targetComment.classList.add('comment-collapsed');
    
                }
    
            })
    
            // add a readmore button
        }
    }

}

function createNewComment(commentObject) {

    const newComment = document.createElement('div');
    newComment.classList.add('comment-outer-wrapper');

    newComment.innerHTML = `
                <div class="comment-container">

                    <div class="profile-image-column">
                        <div class="profile-image-container"><img src="${commentObject.authorProfileImageUrl}" alt=""></div>
                    </div>

                    <div class="comment-main-container">
                        <div class="comment-header">
                            <span class="author-name">${commentObject.authorDisplayName}</span>
                            <span class="comment-published-time">${commentObject.publishedAt}</span>
                            <span class="comment-updated-time"></span>
                        </div>

                        <div class="comment-content-container">
                            <div class="comment-text-container comment-collapsed">${commentObject.textDisplay}</div>
                            
                        </div>

                        <div class="comment-actions-container">
                            <button class="like-comment-button"><img src="./assets/comments-section-icons/liked.svg" alt=""><span class="comment-like-count">${commentObject.likeCount}</span></button>
                            <button class="dislike-comment-button"><img src="./assets/comments-section-icons/disliked.svg" alt=""></button>
                            <button class="reply-comment-button">REPLY</button>
                        </div>
                    </div>
                    
                </div>

                <div class="replies-section hide">
                    
                </div>`;

    // TODO: add update time to comment   

    const mainCommentContainer = newComment.querySelector('.comment-container');
    mainCommentContainer.setAttribute('data-id', commentObject.commentId);

    mainCommentContainer.addEventListener('click', toggleRepliesSection);

    return newComment;
}

function displayVideoIframe() {

    window.onload = ()=> {

        if (YT) {
            new YT.Player(videoPlayerContainer.id, {
                height: videoPlayerContainer.scrollHeight.toString(),
                width: videoPlayerContainer.scrollWidth.toString(),
                videoId: targetVideoId
            })
        } 
    }
}

async function toggleRepliesSection() {
    
    // expand/collapse the comment by dynamically clicking Readmore if found
    const commentContainer = this;
    const commentOuterWrapper = commentContainer.parentElement;

    const commentText = commentContainer.querySelector('.comment-text-container');    
    
    if (commentContainer.querySelector('.expand-comment-toggle')) {        
        if (commentText.classList.contains('comment-collapsed')) {            
            commentContainer.querySelector('.expand-comment-toggle').click();
        }
    }


    const repliesSection = commentOuterWrapper.querySelector('.replies-section');
    console.log(commentContainer, repliesSection);


    // if replies are visible, hide them
    if (!repliesSection.classList.contains('hide')) {
        repliesSection.classList.add('hide');
        console.log('hiding replies')
    }
    else {
        // replies are already added, just show them
        if (repliesSection.childElementCount !== 0) {

            repliesSection.classList.remove('hide');
            return;
        }

        // replies must be fetched and rendered
        const parentId = commentContainer.getAttribute('data-id');
        const repliesArray = await getCommentReplies(parentId);

        // if any replies are found
        if (repliesArray) {
            
            // show repliesSection
            repliesSection.classList.remove('hide');
            
            // create an element for each reply data object and add it to the replies section
            repliesArray.forEach((replyObject)=> {
                const newReply = createNewReply(replyObject);
                repliesSection.appendChild(newReply);
                
            })
        }

    }


}

function createNewReply(replyObject) {
    const commentContainer = document.createElement('div');
    commentContainer.classList.add('comment-container');

    commentContainer.innerHTML = `
                                    <div class="profile-image-column">
                                        <div class="profile-image-container"><img src="${replyObject.authorProfileImageUrl}" alt=""></div>
                                    </div>
        
                                    <div class="comment-main-container">

                                        <div class="comment-header">
                                            <span class="author-name">${replyObject.authorDisplayName}</span>
                                            <span class="comment-published-time">${replyObject.publishedAt}</span>
                                            <span class="comment-updated-time"></span>
                                        </div>
        
                                        <div class="comment-content-container">
                                            <div class="comment-text-container">${replyObject.textDisplay}</div>
                                            
                                        </div>
        
                                        <div class="comment-actions-container">
                                            <button class="like-comment-button"><img src="./assets/comments-section-icons/liked.svg" alt=""><span class="comment-like-count">${replyObject.likeCount}</span></button>
                                            <button class="dislike-comment-button"><img src="./assets/comments-section-icons/disliked.svg" alt=""></button>                                        
                                        </div>

                                    </div>
    `;

    return commentContainer;
}


renderVideoPlayer(); 


const videoPlayer_searchForm = document.querySelector('.search-wrapper');
const searchInput = videoPlayer_searchForm.search;

videoPlayer_searchForm.addEventListener('submit', (event)=> {

    event.preventDefault();

    const searchTrigger = searchInput.value;

    sessionStorage.setItem('searchTrigger', searchTrigger)

    window.location.pathname = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/')) + '/index.html';

    videoPlayer_searchForm.reset();
})


function renderRecommendedVideos() {
    videoObjectsArray.forEach((videoDetailsObject)=> {
        
        if(videoDetailsObject.videoId === targetVideoId) {
            return;
        }

        renderRecommendedVideoElement(videoDetailsObject);
    })
}

async function renderChannelVideosSection() {

    const searchResultItems = await fetchSearchResultsByChannel(videoObject.channelId);

    videoDetailsArray = await getUsefulVideoDataList(searchResultItems);

    videoDetailsArray.forEach((videoDetailsObject)=> {
        renderRecommendedVideoElement(videoDetailsObject);
    })
}

async function fetchSearchResultsByChannel(channelId, maxResults) {
    let response;
    let responseBody;
    const number = maxResults ? maxResults : 10;

    try {
        response = await fetch(
            `${base_url}/search?key=${api_key}&channelId=${channelId}&maxResults=${number}&type=video&part=snippet&order=viewCount`
        );
        if (response.ok) {
            responseBody = await response.json();
        } else {
            throw new Error("FETCH request failed");
        }
    } catch (e) {
        console.log(e);
    }

    return responseBody.items;
}

function renderRecommendedVideoElement(videoDetailsObject) {
    const recommendedVideoDisplaySection = document.querySelector('.recommends-thumbnail-display-section');

    const newVideoContainer = document.createElement('div');
    newVideoContainer.classList.add('recommends-thumbnail-container');
    newVideoContainer.classList.add('thumbnail-container');
    newVideoContainer.setAttribute('data-id', videoDetailsObject.videoId);

    newVideoContainer.innerHTML = `
        <div class="thumbnail-image-container">            
            <div class="video-duration-container">${videoDetailsObject.videoDuration}</div>
        </div>

        <div class="thumbnail-details-container">

            <div class="thumbnail-data-column">

                <div class="video-title-container">${videoDetailsObject.videoTitle}</div>
                <div class="video-details-container">
                    <div>${videoDetailsObject.channelTitle}</div>
                    <div>
                        <span>${videoDetailsObject.videoViewCount}</span>
                        <span>&#183 ${videoDetailsObject.sincePublishDate}</span>
                    </div>
                </div>

            </div>
        </div>
    `;
    newVideoContainer.querySelector('.thumbnail-image-container').style.backgroundImage = `url(${videoDetailsObject.thumbnailUrl})`;

    recommendedVideoDisplaySection.appendChild(newVideoContainer);

    updateThumbnailClickEvents()
}

const allSearchTags = document.querySelectorAll('.tag');

const allVideosTag = document.querySelectorAll('.tag')[0];
const channelVideoTag = document.querySelectorAll('.tag')[1];
    channelVideoTag.textContent = `More from ${videoObject.channelTitle}`;

allSearchTags.forEach((tag)=> {
    tag.addEventListener('click', (event)=> {
    
        const recommendsDisplaySection = document.querySelector('.recommends-thumbnail-display-section');
        const new_recommendsDisplaySection = recommendsDisplaySection.cloneNode();
    
        recommendsDisplaySection.replaceWith(new_recommendsDisplaySection);
    
        if (event.target === allVideosTag) {
            renderRecommendedVideos();
        }
        else if(event.target === channelVideoTag) {
            renderChannelVideosSection();
        }
    })
})
