var viewModel = {
    newCompany:
    {
        CompanyName: ko.observable(),
        CompanyPhoneNumber: ko.observable(),
        CompanyFaxNumber: ko.observable(),
        Website: ko.observable(),
        BillingStreetAddress1: ko.observable(),
        BillingStreetAddress2: ko.observable(),
        BillingStreetAddress3: ko.observable(),
        BillingCity: ko.observable(),
        BillingState: ko.observable(),
        BillingZipCode: ko.observable()
    },
    newContact:
    {
        ContactFirstName: ko.observable(),
        ContactMiddleName: ko.observable(),
        ContactLastName:  ko.observable(),
        ContactEmailAddress: ko.observable(),
        ContactPhoneNumber: ko.observable()
    },
    requestCompanyCreation: function () {
        var companyObj = ko.toJSON(viewModel.newCompany);
        console.log(ko.toJSON(viewModel));

        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "http://localhost:64505/api/companies/CreateCompany",
            data: ko.toJSON(viewModel),
            success: function () {
                $("#AccountDetailsEdit").hide();
                $("#AccountDetails").show();

                $.notify(notification.success, "success");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //$.notify(notification.error, "error");
            }
        });
    },
};

ko.applyBindings(viewModel, document.getElementById("page"));