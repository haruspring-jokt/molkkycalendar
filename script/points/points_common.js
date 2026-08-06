$(async function () {
    $('.navbar').removeClass('is-primary').addClass('is-danger');
    $('.footer').addClass('has-background-danger');
    appendPointsPageCommonParts();
});

function appendPointsPageCommonParts() {
    appendCommonPointsInfoForm();
    appendCommonPointsSiteLinks();
    appendCommonGoogleAds();
} 