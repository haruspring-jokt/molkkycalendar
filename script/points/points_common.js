$(async function () {
    $('.navbar').removeClass('is-primary').addClass('is-danger');
    appendPointsPageCommonParts();
});

function appendPointsPageCommonParts() {
    appendCommonPointsInfoForm();
    appendCommonPointsSiteLinks();
    appendCommonGoogleAds();
} 