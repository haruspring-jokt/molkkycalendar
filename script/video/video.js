$(async function () {
    appendVideoPageCommonParts();
    initVideoFilter();
    createRecentVideos();
});

function appendVideoPageCommonParts() {
    appendCommonEventInfoForm();
    appendCommonSiteLinks();
    appendCommonGoogleAds();
}

function initVideoFilter() {
    $('.video-type-filter').click(function () {
        const filter = $(this).data('video-filter');
        $('.video-type-filter')
            .removeClass('is-primary')
            .addClass('is-light')
            .attr('aria-pressed', 'false');
        $(this)
            .removeClass('is-light')
            .addClass('is-primary')
            .attr('aria-pressed', 'true');

        applyVideoFilter(filter);
    });
}

function applyVideoFilter(filter) {
    const videos = $('#recent-videos tbody tr');
    if (filter === 'video') {
        videos.show().filter('.short-video').hide();
    } else if (filter === 'short') {
        videos.hide().filter('.short-video').show();
    } else {
        videos.show();
    }
}

function getVideoDurationInSeconds(duration) {
    const parts = String(duration || '').split(':').map(Number);
    if (parts.length === 2) {
        const [minutes, seconds] = parts;
        return Number.isInteger(minutes) && minutes >= 0
            && Number.isInteger(seconds) && seconds >= 0 && seconds < 60
            ? minutes * 60 + seconds
            : null;
    }
    if (parts.length === 3) {
        const [hours, minutes, seconds] = parts;
        return Number.isInteger(hours) && hours >= 0
            && Number.isInteger(minutes) && minutes >= 0 && minutes < 60
            && Number.isInteger(seconds) && seconds >= 0 && seconds < 60
            ? hours * 3600 + minutes * 60 + seconds
            : null;
    }
    return null;
}

/**
 * 最近の動画リストを取得
 */
async function createRecentVideos() {
    try {
        const videos = await fetchRecentVideos(50);
        appendRecentVideos(videos);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

/**
 * 最近の動画リストを描画
 * @param {} videos 
 */
function appendRecentVideos(videos) {
    videos.sort((a, b) => b['uoload_date'] - a['uoload_date']);

    for (const i in videos) {
        const video = videos[i];
        const durationSeconds = getVideoDurationInSeconds(video.video_duration);
        const isShort = /#shorts/i.test(String(video.video_title || ''))
            || (durationSeconds !== null && durationSeconds <= 60);
        const rowClass = isShort ? 'short-video' : '';

        // Format upload_date to JST (UTC+9) in yyyy-MM-dd format
        const uploadDate = new Date(new Date(video.uoload_date).getTime() + 9 * 60 * 60 * 1000);
        const formattedDate = `${uploadDate.getFullYear()}-${String(uploadDate.getMonth() + 1).padStart(2, '0')}-${String(uploadDate.getDate()).padStart(2, '0')}`;

        $('#recent-videos').append(
            `<tr class="${rowClass}">
                <td class="is-middle" style="width: 120px;">
                    <a class="" href="${video.video_url}" target="_blank">
                        <img class="thumbnail p-0" src="${video.thumbnail_url}" />
                    </a>
                </td>
                <td class="is-middle">
                    <p class="is-size-65 m-0"><a class="" href="${video.video_url}" target="_blank">${video.video_title}</a></p>
                    <p class="subtitle is-size-7 has-text-grey m-0">
                        <i class="lar la-calendar"></i> ${formattedDate} <i class="las la-tv"></i> ${video.channel_name}
                    </p>
                </td>
            </tr>`
        );
    }

}
