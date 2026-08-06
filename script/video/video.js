$(async function () {
    appendVideoPageCommonParts();
    createRecentVideos();
});

function appendVideoPageCommonParts() {
    appendCommonEventInfoForm();
    appendCommonSiteLinks();
    appendCommonGoogleAds();
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

        // Format upload_date to JST (UTC+9) in yyyy-MM-dd format
        const uploadDate = new Date(new Date(video.uoload_date).getTime() + 9 * 60 * 60 * 1000);
        const formattedDate = `${uploadDate.getFullYear()}-${String(uploadDate.getMonth() + 1).padStart(2, '0')}-${String(uploadDate.getDate()).padStart(2, '0')}`;

        $('#recent-videos').append(
            `<tr class="">
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
