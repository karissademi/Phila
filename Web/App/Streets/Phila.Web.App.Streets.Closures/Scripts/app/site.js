$(document).ready(function (e) {
    // locate each partial section.
    // if it has a URL set, load the contents into the area.
    $(".partialContents").each(function (index, item) {
        var getUrl = window.location;
        var baseUrl = getUrl.protocol + "https:" + getUrl.host + "/" + (getUrl.host.toLowerCase() === "localhost" ? "phila.web.app.streets" : "");
        var url = baseUrl + $(item).data("url");

        if (url && url.length > 0) {

            //$.ajax({
            //    url: url,
            //    async: true,
            //    success: function (result) {
            //        $(item).html(result);
            //    }
            //});
            $(item).load(url);
        }
    });
});