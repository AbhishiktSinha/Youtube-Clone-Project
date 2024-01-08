const api_key = "AIzaSyDwOmNXc0vkt9qkXndy_qZTqI1a-TFprgI";
const alt_api_key = "AIzaSyCFlVyLO8lxfZDjtZw8Cyqgcv_RuQmYR48";
//               AIzaSyDwOmNXc0vkt9qkXndy_qZTqI1a-TFprgIn
const base_url = "https://www.googleapis.com/youtube/v3";

class FetchError {
    constructor(message) {
        super.constructor(message);
        this.message = message;
    }
}

async function fetchSearchResults(searchQuery, maxResults) {
    let response;
    let responseBody;
    try {
        response = await fetch(
            `${base_url}/search?key=${api_key}&q=${searchQuery}&maxResults=${maxResults}&type=video&part=snippet&/m/01k8wb&relevanceLanguage=en`
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

async function fetchChannelData(channelId) {
    const url = `${base_url}/channels?key=${api_key}&part=snippet,statistics&id=${channelId}`;

    let response = null;
    let responseBody = null;

    try {
        response = await fetch(url);
        if (!response.ok) {
            throw new FetchError("ERORR: Fetch request failed for: " + url);
        }

        try {
            responseBody = await response.json();
        } catch (e) {
            console.log(e);
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }

    console.log("CHANNEL DETAILS:\n", responseBody.items[0]);
    return responseBody.items[0];
}

async function fetchVideosByChannelId(channelId, number) {
    const maxResults = number ? number : 8;

    const url = `${base_url}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=viewCount&regionCode=es&type=video&key=${api_key}`;

    let response;
    let responseBody;
    try {
        response = await fetch(url);
        if (response.ok) {
            responseBody = await response.json();
        } else {
            throw new Error("FETCH request failed");
        }
    } catch (e) {
        console.log(e);
    }

    // responseBody.items has all the videos
    // TODO: create usable searched video object using existing functions
}

async function fetchVideoStatsAndDetails(videoId) {
    const url = `${base_url}/videos?key=${api_key}&part=statistics,snippet,contentDetails&id=${videoId}`;

    let response = null;
    let responseBody = null;

    try {
        response = await fetch(url);
        if (!response.ok) {
            throw new Error("ERROR: Fetch request failed for:", url);
        }

        try {
            responseBody = await response.json();
        } catch (e) {
            console.log("ERROR: Could not parse:", url, "\n", e);
        }
    } catch (e) {
        console.log(e);
    }

    // console.log("VIDEO DETAILS: \n", responseBody.items[0]);
    return {
        contentDetails: responseBody.items[0].contentDetails,
        statistics: responseBody.items[0].statistics,
    };
}

async function fetchChannelLogo(channelId) {
    const channelData = await fetchChannelData(channelId);
    console.log(channelData);
    let url = null;

    if (channelData) {
        url = channelData.snippet.thumbnails.default.url;
    }
    return url;
}

// returns an array of promises resolved with the comment data
async function fetchComments(videoId,sortOrder,number) {
    const maxResults = number ? number : 20
    const order = sortOrder ? sortOrder : 'relevance'
    const url = `${base_url}/commentThreads?key=${api_key}&videoId=${videoId}&maxResults=${maxResults}&part=snippet&order=${order}`;

    let response = null;
    let responseBody = null;

    const commentsArray = [];

    try {
        response = await fetch(url);
        if (!response.ok) {
            throw new FetchError("ERORR: Fetch request failed for: " + url);
        }

        try {
            responseBody = await response.json();
        } catch (e) {
            console.log(e);
            return null;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
    
    responseBody.items.forEach((item)=> {
        
        const commentSnippet = item.snippet.topLevelComment.snippet;
        const usefulData = getUsefulCommentData(commentSnippet);
        usefulData['commentId'] = item.id;
        commentsArray.push(usefulData);
    })

    return commentsArray;
    // console.log(responseBody.items[0]);
    // return responseBody.items;
}

// console.log(fetchVideo('javascript promises', 3));

async function renderSearchResults(searchQuery) {    
    const items = await fetchSearchResults(searchQuery, 9);

    const videoDetailsArray = await getUsefulVideoDataList(items);

    videoDetailsArray.forEach((videoDetailsObject)=> {
        renderHomeVideo(videoDetailsObject);
    })
    
    sessionStorage.setItem(
                "renderableVideoProperties",
                JSON.stringify(videoDetailsArray)
            );

    // const usefulItemProperties = items.map((item) => {
    //     return {
    //         videoId: item.id.videoId,
    //         channelId: item.snippet.channelId,
    //         thumbnailUrl: item.snippet.thumbnails.high.url,
    //         videoTitle: item.snippet.title,
    //         channelTitle: item.snippet.channelTitle,
    //         sincePublishDate: shortenTimeDifference(item.snippet.publishedAt),
    //     };
    // });
    
    // const itemPromiseArr = [];
    // usefulItemProperties.forEach((itemDetails) => {
    //     // returns a promise of updating the properties with neccessary data
    //     // don't await, we need the promises, not the result
    //     itemPromiseArr.push(updateSearchItemProperties(itemDetails));
    // });


    // // ADD ALL THE VIDEO OBJECTS TO AN ARRAY, THEN TO LOCAL_STORAGE, RENDER FROM THE RESOLVED ARRAY
    
    // const resolvedArray = await Promise.all(itemPromiseArr);

    // if (renderMethod === 'HOME_SCREEN_VIDEO') {
        
    // }
    // else if (renderMethod === 'RECOMMENDED_CHANNEL_VIDEO') {
    //     sessionStorage.setItem('recommendedChannelVideoProperties', JSON.stringify(resolvedArray));
    //     return 'added channelVideo data to sessionStorage';
    // }
        
    // resolvedArray.forEach((renderable_videoDetailsObject)=> {        
    //     renderHomeVideo(renderable_videoDetailsObject);
    // })
    
    return 'done from renderSearchResults';

    /* 
    for (let index = 0; index < itemPromiseArr.length; index++) {
        const videoItemPromise = itemPromiseArr[index];

        renderHomeVideo(videoItemPromise);
    }
    */
}

async function getUsefulVideoDataList(items) {

    const usefulItemProperties = items.map((item) => {
        return {
            videoId: item.id.videoId,
            channelId: item.snippet.channelId,
            thumbnailUrl: item.snippet.thumbnails.high.url,
            videoTitle: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            sincePublishDate: shortenTimeDifference(item.snippet.publishedAt),
        };
    });
    
    const itemPromiseArr = [];
    usefulItemProperties.forEach((itemDetails) => {
        // returns a promise of updating the properties with neccessary data
        // don't await, we need the promises, not the result
        itemPromiseArr.push(updateSearchItemProperties(itemDetails));
    });


    // ADD ALL THE VIDEO OBJECTS TO AN ARRAY, THEN TO LOCAL_STORAGE, RENDER FROM THE RESOLVED ARRAY
    
    const resolvedArray = await Promise.all(itemPromiseArr);

    return resolvedArray;
}


async function updateSearchItemProperties(itemDetails) {
    const videoStatsObject = await fetchVideoStatsAndDetails(itemDetails.videoId);

    const videoDuration = convertVideoDuration(
        videoStatsObject.contentDetails.duration
    );
    const videoViewCount = shortenNumber(videoStatsObject.statistics.viewCount);
    const videoLikeCount = shortenNumber(videoStatsObject.statistics.likeCount);
    const videoCommentCount = shortenNumber(videoStatsObject.statistics.commentCount);

    const channelDetailsObject = await fetchChannelData(itemDetails.channelId);
    const channelLogoUrl = channelDetailsObject.snippet.thumbnails.default.url;
    const channelSubscriberCount = shortenNumber(channelDetailsObject.statistics.subscriberCount);
    const channelDescription = channelDetailsObject.snippet.description;

    itemDetails.videoDuration = videoDuration;
    itemDetails["videoViewCount"] = videoViewCount;
    itemDetails["channelLogoUrl"] = channelLogoUrl;
    itemDetails['likeCount'] = videoLikeCount;
    itemDetails['commentCount'] = videoCommentCount;
    itemDetails['channelSubscriberCount'] = channelSubscriberCount;
    itemDetails['videoDescription'] = channelDescription;

    return itemDetails;
}

async function renderHomeVideo(videoDetailsObject) {

    const newVideoItem = document.createElement("div");
    newVideoItem.classList.add("thumbnail-container");
    newVideoItem.setAttribute("data-id", videoDetailsObject.videoId);

    newVideoItem.innerHTML = `<div class="thumbnail-image-container">
                            <span class="video-duration-container">${videoDetailsObject.videoDuration}</span>
                        </div>
                        <div class="thumbnail-details-container">
                            <div class="channel-logo-column">
                                <div class="channel-icon-container">
                                    <img src='${videoDetailsObject.channelLogoUrl}'>
                                </div>
                            </div>
                            <div class="thumbnail-data-column">
                                <div class="video-title-container">${videoDetailsObject.videoTitle}</div>
                                <div class="video-details-container">
                                    <div>${videoDetailsObject.channelTitle}</div>
                                    <div>
                                        <span>${videoDetailsObject.videoViewCount}</span>
                                        <span>&#183 ${videoDetailsObject.sincePublishDate}</span>
                                    </div>
                                </div>
                            </div>`;

    newVideoItem.querySelector(
        ".thumbnail-image-container"
    ).style.backgroundImage = `url(${videoDetailsObject.thumbnailUrl})`;

    const thumbnailDisplaySection = document.querySelector(
        ".thumbnail-display-section"
    );
    thumbnailDisplaySection.appendChild(newVideoItem);
}

function convertVideoDuration(ISO_time) {
    const hours = ISO_time.includes("H")
        ? ISO_time.slice(2, ISO_time.indexOf("H"))
        : null;

    let minutes = (ISO_time.includes('M')) ? (
        hours ? (ISO_time.slice(ISO_time.indexOf("H") + 1, ISO_time.indexOf("M"))) :
        ISO_time.slice(2, ISO_time.indexOf("M")) ) :
        null;
    minutes = (minutes && hours && (minutes.length === 1)) ? '0'+minutes : minutes;

    let seconds = minutes ? ISO_time.slice(ISO_time.indexOf("M") + 1, -1) : ISO_time.slice(2,-1);
    seconds = (seconds.length === 1) ? '0'+seconds : seconds;


    let duration = '';
    
    if (hours) {
        duration += hours + ":";
    }
    if (minutes) {
        duration += minutes + ":";
    }
    else {
        duration += "0:";
    }
    duration += seconds.length === 0 ? '00' : seconds;

    return duration;
}
function shortenTimeDifference(ISODateString) {
    const startDate = new Date(ISODateString);
    // console.log(startDate);
    const endDate = new Date();

    // time units in milliseconds
    const ms_sec = 1000;
    const ms_min = ms_sec * 60;
    const ms_hour = ms_min * 60;
    const ms_day = ms_hour * 24;
    const ms_week = ms_day * 7;
    const ms_month = ms_day * 30;
    const ms_year = ms_day * 365;

    // console.log(ms_day);

    // time difference in milliseconds
    const ms_difference = endDate.getTime() - startDate.getTime();

    if (Math.floor(ms_difference / ms_year) > 0) {
        return convertTime(ms_year, "year");
    } else if (Math.floor(ms_difference / ms_month) > 0) {
        return convertTime(ms_month, "month");
    } else if (Math.floor(ms_difference / ms_week) > 0) {
        return convertTime(ms_week, "week");
    } else if (Math.floor(ms_difference / ms_day) > 0) {
        return convertTime(ms_day, "day");
    } else if (Math.floor(ms_difference / ms_hour) > 0) {
        return convertTime(ms_hour, "hour");
    } else if (Math.floor(ms_difference / ms_min)) {
        return convertTime(ms_min, "min");
    } else {
        return convertTime(ms_sec, "second");
    }

    function convertTime(divisor, suffix) {
        const timeUnit = Math.floor(ms_difference / divisor);
        suffix = timeUnit > 1 ? suffix + "s" : suffix;
        return timeUnit.toString() + " " + suffix + " ago";
    }
}
function shortenNumber(number) {
    const M = 1000000;
    const B = 1000 * M;
    const K = 1000;

    if (Math.floor(number / B)) {
        return (number / B).toFixed(1) + "B";
    } else if (Math.floor(number / M)) {
        return (number / M).toFixed(1) + "M";
    } else if (Math.floor(number / K)) {
        return Math.floor(number / K) + "K";
    } else {
        return number;
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------

// returns an array of promises resolved with the comment reply data
async function getCommentReplies(parentCommentId, number) {
    const maxResults = number ? number : 8;
    const url = `${base_url}/comments?parentId=${parentCommentId}&maxResults=${maxResults}&key=${api_key}`;

    let responseObject, repliesData;
    const replyIdArray = [];
    const replyObjectsArr = [];

    // get reply ids for all replies
    try {
        responseObject = await fetch(url);
        

        if (responseObject.ok) {
            try {
                repliesData = await responseObject.json();

                if (repliesData.items.length === 0) {
                    throw new Error('No replies found')
                }
                
                const repliesArray = repliesData.items;

                repliesArray.forEach((replyObject) => {
                    replyIdArray.push(replyObject.id);
                });
            } catch (e) {
                throw e;
            }
        } else {
            throw new Error("Error in fetching replies");
        }
    } catch (e) {
        console.log(e);
        return null;
    }

    
    // get reply data corresponding to the ids
    for (let index = 0; index < replyIdArray.length; index++) {
        
        replyObjectsArr.push(await getReplyCommentObject(replyIdArray[index]));
    }

    // console.log(replyObjectsArr);
    return replyObjectsArr;

    // TODO: pass each element of the array to a RENDERING function
}

async function getReplyCommentObject(replyID) {
    const url = `${base_url}/comments?part=snippet&id=${replyID}&key=${api_key}`;

    const response = await fetch(url);
    const responseBody = await response.json();

    // console.log(responseBody.items[0].snippet);

    return getUsefulCommentData(responseBody.items[0].snippet);
}

function getUsefulCommentData(commentSnippet) {
    const commentDetailsObject = {
        authorDisplayName: commentSnippet.authorDisplayName,
        authorProfileImageUrl: commentSnippet.authorProfileImageUrl,

        textDisplay: commentSnippet.textDisplay,
        parentId: commentSnippet.parentId,
        likeCount: commentSnippet.likeCount,
        publishedAt: shortenTimeDifference(commentSnippet.publishedAt),
    };

    if (commentSnippet.publishedAt !== commentSnippet.updatedAt) {
        commentDetailsObject.updatedAt = commentSnippet.updatedAt;
    }

    return commentDetailsObject;
}
