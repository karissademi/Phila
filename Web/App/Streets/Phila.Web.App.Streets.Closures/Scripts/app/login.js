var notification = {
    errorSendingSecToken: "We were unable to send you a new security token.",
    invalidSecToken: "Sorry, but your Security Code was not correct. You can use the Get Code button to have a new code emailed to you.",
    secTokenSent: "A new security code has been emailed to you. It may take a few moments before arriving in your inbox.",
    recordNotSaved: "Record was not saved.",
    recordSaved: "Record was saved",
    attempingToSendEmail: "Attempting to send email...",
    success: "Success!",
    error: "Error [:*-^((]-[==='"
};

var viewModel = {
    companies: ko.observableArray(),
    contacts: ko.observableArray(),
    permits: ko.observableArray(),
    permitTypes: ko.observableArray(),
    contactRoles: ko.observableArray(),
    selectedCompanyId: ko.observable(),
    selectedCompany:
    {
        CompanyId: ko.observable(),
        CompanyName: ko.observable(),
        CompanyPhoneNumber: ko.observable(),
        CompanyFaxNumber: ko.observable(),
        Website: ko.observable(),
        BillingStreetAddress1: ko.observable(),
        BillingStreetAddress2: ko.observable(),
        BillingStreetAddress3: ko.observable(),
        BillingCity: ko.observable(),
        BillingState: ko.observable(),
        BillingZipCode: ko.observable(),
        PhiladelphiaTaxId: ko.observable(),
        edit:
        {
            CompanyId: ko.observable(),
            CompanyName: ko.observable(),
            CompanyPhoneNumber: ko.observable(),
            CompanyFaxNumber: ko.observable(),
            Website: ko.observable(),
            BillingStreetAddress1: ko.observable(),
            BillingStreetAddress2: ko.observable(),
            BillingStreetAddress3: ko.observable(),
            BillingCity: ko.observable(),
            BillingState: ko.observable(),
            BillingZipCode: ko.observable(),
            PhiladelphiaTaxId: ko.observable()
        }
    },
    selectedContact:
    {
        ContactId: ko.observable(),
        ContactFirstName: ko.observable(),
        ContactLastName: ko.observable(),
        Username: ko.observable(),
        ContactEmailAddress: ko.observable(),
        ContactPhoneNumber: ko.observable(),
        SecurityToken: ko.observable(),
        ContactFullName: ko.pureComputed(function() {
            return viewModel.selectedContact.ContactFirstName() + " " + viewModel.selectedContact.ContactLastName();
        })
    },
    // Support for the Philadelphia Streets Dept's ...
    selectedPermitTypes:
    {
        permitTypes: ko.observableArray(),
        sort: function () {
            this.permitTypes(this.permitTypes.sort(function (a, b) { return a - b; }));
        },
        toBinary: function () {
            var a = [];
            for (var i = 0; i < viewModel.permitTypes().length; i++)
                a.push("0");

            for (var j = 0; j < this.permitTypes().length; j++)
                a[parseInt(this.permitTypes()[j]) - 1] = "1";

            var b = "";

            for (var k = 0; k < a.length; k++)
                b += a[k];

            return b;
        },
        binary2Decimal: function (bin) {
            return parseInt(bin, 2);
        },
        decimal2Binary: function (dec) {
            var bin = (dec >>> 0).toString(2);
            var len = bin.length;
            var dif = viewModel.permitTypes().length - len;
            for (var i = 0; i < dif; i++) 
                bin = "0" + bin;

            return bin;
        }
    },
    addPermit: function(item) {
        this.permits.push({
            $id: item.$id,
            PermitId: item.PermitId,
            Purpose: item.Purpose,
            PermitLocation: item.PermitLocation,
            StartDate: item.StartDate,
            EndDate: item.EndDate,
            PermitStatus: item.PermitStatus
        });
    },
    removePermit: function(permit) {
        this.schedules.remove(permit);
    },
    savePermits: function() {
        $.ajax({
            url: "",
            data: JSON.stringify({ permits: this.permits }),
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            success: function(data) {
                $.notify(notification.recordSaved, "success");
            },
            error: function(request, status, error) {
                $.notify(notification.recordNotSaved, "error");
            }
        });
    },
    getCompanies: function(searchTerm, callback) {
        $.ajax({
            dataType: "json",
            type: "GET",
            url: "http://localhost/Phila.Web.Api.Streets/api/companies/GetCompaniesAutocomplete?companyName=" + searchTerm,
        }).done(callback);
    },
    verifyToken: function() {
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: "http://localhost/Phila.Web.Api.Streets/api/UserToken/AuthenticateSecurityToken?contactId=" + viewModel.selectedContact.ContactId() + "&securityToken=" + viewModel.selectedContact.SecurityToken(),
            success: function(data) {
                if (data === true) {
                    getClosuresForCompany();
                    getCompanyDetails();
                    $("#LoginPage").fadeOut("fast");
                    $("#AccountContactHeader").fadeIn("fast");
                    $("#AccountOverview").fadeIn("fast");
                } else {
                    $.notify(notification.invalidSecToken, "error");
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $.notify(notification.errorSendingSecToken, "error");
            }
        });
    },
    selectContact: function(data) {
        viewModel.selectedContact.ContactId(data.ContactId);
        viewModel.selectedContact.ContactFirstName(data.ContactFirstName);
        viewModel.selectedContact.ContactLastName(data.ContactLastName);
        viewModel.selectedContact.Username(data.Username);
        viewModel.selectedContact.ContactEmailAddress(data.ContactEmailAddress);
        viewModel.selectedContact.ContactPhoneNumber(data.ContactPhoneNumber);
        $("#EnterCodeSection").show();
    },
    selectCompany: function(data) {
        viewModel.selectedCompany.CompanyName(data.CompanyName);
        viewModel.selectedCompany.CompanyId(data.CompanyId);
        viewModel.selectedCompany.CompanyPhoneNumber(data.CompanyPhoneNumber);
        viewModel.selectedCompany.CompanyFaxNumber(data.CompanyFaxNumber);
        viewModel.selectedCompany.Website(data.Website);
        viewModel.selectedCompany.BillingStreetAddress1(data.BillingStreetAddress1);
        viewModel.selectedCompany.BillingStreetAddress2(data.BillingStreetAddress2);
        viewModel.selectedCompany.BillingStreetAddress3(data.BillingStreetAddress3);
        viewModel.selectedCompany.BillingCity(data.BillingCity);
        viewModel.selectedCompany.BillingState(data.BillingState);
        viewModel.selectedCompany.BillingZipCode(data.BillingZipCode);
    },
    sendAccessCode: function(data) {
        viewModel.selectContact(data);
        $.notify(notification.attempingToSendEmail, "info");
        $.ajax({
            type: "PUT",
            contentType: "application/json; charset=utf-8",
            url: "http://localhost/phila.web.api.streets/api/UserToken/CreateSecurityToken?contactId=" + viewModel.selectedContact.ContactId(),
            success: function() {
                $("#EnterCodeSection").show();
                $.notify(notification.secTokenSent, "success");
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $.notify(notification.errorSendingSecToken, "error");
            }
        });
    },
    requestCompanyInfoUpdate: function() {
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "http://localhost/Phila.Web.Api.Streets/api/companies/UpdateCompanyInfo?contactId=" + viewModel.selectedContact.ContactId() + "&securityToken=" + viewModel.selectedContact.SecurityToken(),
            data: ko.toJSON(viewModel.selectedCompany.edit),
            success: function() {
                $("#AccountDetailsEdit").hide();
                $("#AccountDetails").show();

                $.notify(notification.success, "success");
            },
            error: function(xhr, ajaxOptions, thrownError) {
                $.notify(notification.error, "error");
            }
        });
    },
    editCompany: function() {
        $("#AccountDetails").hide();
        $("#AccountDetailsEdit").show();
        viewModel.selectedCompany.edit.CompanyId(viewModel.selectedCompany.CompanyId());
        viewModel.selectedCompany.edit.CompanyName(viewModel.selectedCompany.CompanyName());
        viewModel.selectedCompany.edit.CompanyPhoneNumber(viewModel.selectedCompany.CompanyPhoneNumber());
        viewModel.selectedCompany.edit.CompanyFaxNumber(viewModel.selectedCompany.CompanyFaxNumber());
        viewModel.selectedCompany.edit.Website(viewModel.selectedCompany.Website());
        viewModel.selectedCompany.edit.BillingStreetAddress1(viewModel.selectedCompany.BillingStreetAddress1());
        viewModel.selectedCompany.edit.BillingStreetAddress2(viewModel.selectedCompany.BillingStreetAddress2());
        viewModel.selectedCompany.edit.BillingStreetAddress3(viewModel.selectedCompany.BillingStreetAddress3());
        viewModel.selectedCompany.edit.BillingCity(viewModel.selectedCompany.BillingCity());
        viewModel.selectedCompany.edit.BillingState(viewModel.selectedCompany.BillingState());
        viewModel.selectedCompany.edit.BillingZipCode(viewModel.selectedCompany.BillingZipCode());
        viewModel.selectedCompany.edit.PhiladelphiaTaxId(viewModel.selectedCompany.PhiladelphiaTaxId());
    },
    cancelEditCompany: function() {
        $("#AccountDetailsEdit").hide();
        $("#AccountDetails").show();
    },
    getPermitTypes: function() {
        $.ajax({
            type: "GET",
            contentType: 'application/json; charset=utf-8',
            url: "http://localhost/phila.web.api.streets/api/permits/GetPermitTypes",
            success: function(data) {
                viewModel.permitTypes(data);
            },
            error: function(xhr, ajaxOptions, thrownError) {
                //ToDo: handle error
            }
        });
    }
};


viewModel.selectedCompanyId.subscribe(function(newValue) {
    $("#EnterCodeSection").hide();

    if (newValue === undefined) {
        $("#SelectContactSection").hide();
        return false;
    }

    $.ajax({
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        url: "http://localhost/Phila.Web.Api.Streets/api/Contacts/GetContactsByCompanyId?companyId=" + newValue,
        success: function(data, status, xhr) {
            viewModel.contacts(data);
            $("#SelectContactSection").show();
        },
        error: function(xhr, ajaxOptions, thrownError) {
            //ToDo: handle error
        }
    });
    return true;
});

ko.applyBindings(viewModel, document.getElementById("page"));
viewModel.getPermitTypes();

function getRoles() {
    $.ajax({
        type: "GET",
        contentType: 'application/json; charset=utf-8',
        url: "http://localhost/phila.web.api.streets/api/contacts/GetRoles",
        success: function(data) {
            viewModel.contactRoles(data);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            //ToDo: handle error
        }
    });
}

function getCompanyDetails() {
    $.ajax({
        url: "http://localhost/Phila.Web.Api.Streets/api/Permits/GetCompanyByCompanyId?contactId=" + viewModel.selectedContact.ContactId() + " &securityToken=" + viewModel.selectedContact.SecurityToken(),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            viewModel.selectCompany(data);
        },
        error: function(xhr, ajaxOptions, thrownError) {
        }
    });
}

function getClosuresForCompany() {
    $.ajax({
        url: "http://localhost/Phila.Web.Api.Streets/api/Permits/GetPermitByCompanyId?contactId=" + viewModel.selectedContact.ContactId() + " &securityToken=" + viewModel.selectedContact.SecurityToken(),
        contentType: "application/json; charset=utf-8",
        success: function(data) {
            viewModel.permits([]);
            viewModel.permits(data);
        },
        error: function(xhr, ajaxOptions, thrownError) {
        }
    });
}


function ViewModel() {
    var self = this;

    var tokenKey = 'accessToken';

    self.result = ko.observable();
    self.user = ko.observable();

    self.registerEmail = ko.observable();
    self.registerPassword = ko.observable();
    self.registerPassword2 = ko.observable();

    self.loginEmail = ko.observable();
    self.loginPassword = ko.observable();

    function showError(jqXHR) {
        self.result(jqXHR.status + ': ' + jqXHR.statusText);
    }

    self.callApi = function () {
        self.result('');

        var token = sessionStorage.getItem(tokenKey);
        var headers = {};
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }

        $.ajax({
            type: 'GET',
            url: '/api/values',
            headers: headers
        }).done(function (data) {
            self.result(data);
        }).fail(showError);
    }

    self.register = function () {
        self.result('');

        var data = {
            Email: self.registerEmail(),
            Password: self.registerPassword(),
            ConfirmPassword: self.registerPassword2()
        };

        $.ajax({
            type: 'POST',
            url: '/api/Account/Register',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function (data) {
            self.result("Done!");
        }).fail(showError);
    }

    self.login = function () {
        self.result('');

        var loginData = {
            grant_type: 'password',
            username: self.loginEmail(),
            password: self.loginPassword()
        };

        $.ajax({
            type: 'POST',
            url: 'http://localhost/phila.web.api.streets/Token',
            data: loginData
        }).done(function (data) {
            self.user(data.userName);
            // Cache the access token in session storage.
            sessionStorage.setItem(tokenKey, data.access_token);
            //window.location.href("http://localhost/phila.web.app.streets/");
        }).fail(showError);
    }

    self.logout = function () {
        self.user('');
        sessionStorage.removeItem(tokenKey);
    }
}

var app = new ViewModel();
ko.applyBindings(app);