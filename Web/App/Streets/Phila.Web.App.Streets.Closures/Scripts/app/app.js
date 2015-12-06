/// <reference path="../jquery-2.1.4.js" />
/// <reference path="../jquery-2.1.4.intellisense.js" />
/// <reference path="../knockout-3.4.0.js" />
/// <reference path="notification-messages.js" />
/// <reference path="../jquery.animate-colors.js" />
/// <reference path="../notify.js" />
/// <reference path="../knockout.validation.js" />
/// <reference path="ko.editable.js" />
/// <reference path="app-models.js" />
/// <reference path="permit-geo.js" />



//**** View Model
function AppViewModel() {
    var self = this;

    //*** data
    self.companies = ko.observableArray();
    self.contacts = ko.observableArray();
    self.selectedContact = ko.observable();
    self.contactRoles = ko.observableArray();
    self.permitStatusCodes = ko.observableArray();
    self.selectedStatusCode = ko.observable(1);

    self.newPermit = ko.observable(new Permit());


    // data used to populate the app
    self.permits = ko.observableArray();
    self.encroachmentTypes = ko.observableArray();
    self.referenceTypes = ko.observableArray();
    self.projectTypes = ko.observableArray();
    self.permitTypes = ko.observableArray();
    self.occupancyTypes = ko.observableArray();
    self.utilityOwners = ko.observableArray();

    // data used to submit a new permit app
    self.selectedEncroachmentTypes = ko.observableArray();
    self.selectedUtilityOwner = ko.observable();
    self.selectedPermitType = ko.observable();
    self.selectedCompany = ko.observable(new Company());
    self.references = ko.observableArray();
    self.locations = ko.observableArray();
    self.effectiveDate = ko.observable();
    self.expirationDate = ko.observable();
    self.timeOfWork = ko.observable();
    self.purpose = ko.observable();
    self.comments = ko.observable();

    // data for the login email
    self.usersEmailAddress = ko.observable().extend({ email: true, required: true });


    self.totalPermitsFound = ko.observable();
    self.apiUrl = "https://microsoft-apiapp2e9548ef99d54bbea82edae5fe3913a8.azurewebsites.net/"; //"http://localhost/Phila.Web.Api.Streets/"; // 
    self.streetCode = "";
    self.fromStreets = ko.observableArray();

    self.toStreets = ko.observableArray();

    // captions for selects
    self.fromStreetCaption = ko.observable();
    self.toStreetCaption = ko.observable();

    // data for the main permits table
    self.filter = "";
    self.sortDir = "desc";
    self.sort = "permitid";
    self.currentPermitPage = 1;
    self.permitSearch = ko.observable("");
    self.selectedPageSize = ko.observable(5);
    self.pageSizes = ko.observableArray([5, 10, 15, 20, 25]);
    self.radioSearchSelectedOptionValue = ko.observable("all");

    // 
    self.editingItem = ko.observable();
    self.editingLocationItem = ko.observable();
    self.editingReferenceItem = ko.observable();

    // create the transaction for commit and reject
    self.editTransaction = new ko.subscribable();
    self.editLocationTransaction = new ko.subscribable();
    self.editPermitTransaction = new ko.subscribable();
    self.editReferenceTransaction = new ko.subscribable();

    //*** helpers
    self.isContactEditing = function(item) {
        return item == self.editingItem();
    };
    self.isCompanyEditing = function(item) {
        return item == self.editingItem();
    };
    self.isLocationEditing = function(item) {
        return item == self.editingLocationItem();
    };
    self.isPermitEditing = function(item) {
        return item == self.editingItem();
    };
    self.isReferenceEditing = function(item) {
        return item == self.editingReferenceItem();
    };

    //** subscriptions
    self.selectedCompanyChanged = function() {
        if (self.selectedCompany() === undefined) {
            self.showUsersCompaniesSection();
            return;
        }

        try {
            //self.getStatusCodes();
            //self.getPermitsForCompany();
            $("#loading-table").show();
            self.showMainSections();
        } catch (e) {
            //console.log("selectedCompany.subscribe error: " + e);
        }
    };

    //self.selectedPermitType.subscribe(function (data) {
    //    if (data.PermitTypeId() > 10) {
    //        self.selectedUtilityOwner = ko.observable().extend({ required: true });
    //    } else {
    //        self.selectedUtilityOwner = ko.observable().extend({ required: false });
    //    }

    //    if (!ko.validation.validateObservable(self.selectedUtilityOwner)) {
    //        console.log(false);
    //    } else {
    //        console.log(true);
    //    }
    //});

    self.radioSearchSelectedOptionValue.subscribe(function() { //}(data, event) {
        $("#loading-table").show();
        self.getPermitsForCompany();

    });

    //*** methods
    //** contacts
    self.addContact = function(contact) {
        if (!contact)
            contact = new Contact();

        self.contacts.push(contact);

        //  begin editing the new item straight away
        self.editContact(contact);
    };

    self.removeContact = function(contact) {
        if (self.editingItem() == null) {
            var answer = confirm("Are you sure you want to delete this contact?");
            if (answer) {
                self.contacts.remove(contact);
            }
        }
    };

    self.editContact = function(contact) {
        if (self.editingItem() == null) {
            // start the transaction
            contact.beginEdit(self.editTransaction);

            // shows the edit fields
            self.editingItem(contact);
        }
    };

    self.applyContact = function() {
        //  commit the edit transaction
        self.editTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.cancelEditContact = function() {
        //  reject the edit transaction
        self.editTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.selectContact = function(contact) {
        var c = new Contact(contact.ContactId, contact.ContactFirstName, contact.ContactLastName, contact.Username, contact.ContactEmailAddress, contact.ContactPhoneNumber);
        self.selectedContact(c);
        $("#EnterCodeSection").show();
    };

    //** companies
    //self.getCompanies = function(searchTerm, callback) {
    //    $.ajax({
    //        dataType: "json",
    //        type: "GET",
    //        url: self.apiUrl + "api/companies/GetCompaniesAutocomplete?companyName=" + searchTerm,
    //    }).done(callback);
    //};

    self.addCompany = function(company) {
        if (!company)
            company = new Company();

        self.companies.push(company);

        //  begin editing the new item straight away
        //self.editCompany(company);
    };

    self.removeCompany = function(company) {
        if (self.editingItem() == null) {
            var answer = confirm("Are you sure you want to delete this company?");
            if (answer) {
                self.companies.remove(company);
            }
        }
    };

    self.editCompany = function(company) {
        if (self.editingItem() == null) {
            // start the transaction
            company.beginEdit(self.editTransaction);

            // shows the edit fields
            self.editingItem(company);
        }
    };

    self.applyCompany = function() {
        //  commit the edit transaction
        self.editTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.cancelEditCompany = function() {
        //  reject the edit transaction
        self.editTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.requestCompanyInfoUpdate = function() {
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: self.apiUrl + "api/companies/UpdateCompanyInfo?&token=" + getUrlParameter("token"),
            data: ko.toJSON(self.selectedCompany.edit),
            success: function() {
                $("#AccountDetailsEdit").hide();
                $("#AccountDetails").show();

                $.notify(notification.success, "success");
            },
            error: function() { //(xhr, ajaxOptions, thrownError) {
                $.notify(notification.error, "error");
            }
        });
    };

    self.getUsersCompanies = function() {
        $.ajax({
            url: self.apiUrl + "api/companies/GetUsersCompanies?token=" + getUrlParameter("token"),
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                if (data.length == 1) {

                    var company = new Company(data[0].CompanyId, data[0].CompanyName, data[0].CompanyPhoneNumber, data[0].CompanyFaxNumber, data[0].Website, data[0].BillingStreetAddress1, data[0].BillingStreetAddraess2, data[0].BillingStreetAddress3, data[0].BillingCity, data[0].BillingState, data[0].BillingZipCode, data[0].PhiladelphiaTaxId
                    );
                    self.addCompany(company);
                    self.selectedCompany(company);
                    self.showMainSections();
                    self.getStatusCodes();
                    $("#loading-table").show();
                    //self.getPermitsForCompany();
                    $("#UsersCompaniesSection").hide();
                    document.body.scrollTop = document.documentElement.scrollTop = 0;

                } else {
                    //self.companies(data);
                    $(data).each(function(index, item) {
                        self.addCompany(new Company(item.CompanyId, item.CompanyName, item.CompanyPhoneNumber, item.CompanyFaxNumber, item.Website, item.BillingStreetAddress1, item.BillingStreetAddraess2, item.BillingStreetAddress3, item.BillingCity, item.BillingState, item.BillingZipCode, item.PhiladelphiaTaxId));
                    });

                    self.showUsersCompaniesSection();
                }
            },
            //error: function (xhr, ajaxOptions, thrownError) {
            //}
        });
    };

    //** locations
    self.addLocation = function(location) {
        if (location.ToStreet == undefined)
            location = new Location();

        location.OnStreet.editValue.subscribe(function(data) {
            //console.log(data.trim());
            self.getFromStreets(data.trim());
        });


        self.fromStreetCaption("Choose an 'On Street'...");
        self.toStreetCaption("Choose an 'On Street'...");
        self.clearFromAndToOa();

        self.locations.push(location);

        //  begin editing the new item straight away
        self.editLocation(location);

        //console.log(ko.toJSON(location));

    };

    self.removeLocation = function(location) {
        if (self.editingLocationItem() == null) {
            var answer = confirm("'Are you sure you want to delete this location?");
            if (answer) {
                self.locations.remove(location);
            }
        }
    };

    self.editLocation = function(location) {
        if (self.editingLocationItem() == null) {

            //console.log(ko.toJSON(location));

            self.clearFromAndToOa();

            if (location.OnStreet() != undefined) {
                self.getFromStreets(location.OnStreet());
            }

            //if (location.FromStreet().st_name != "blank")
            //    location.FromStreet.editValue(location.FromStreet());

            // start the transaction
            location.beginEdit(self.editLocationTransaction);
            // shows the edit fields
            self.editingLocationItem(location);


        }
    };

    self.applyLocation = function() {
        //  commit the edit transaction
        self.editLocationTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingLocationItem(null);
    };

    self.cancelEditLocation = function() {
        //  reject the edit transaction
        self.editLocationTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingLocationItem(null);
    };

    self.clearFromAndToOa = function() {
        if (self.fromStreets().length > 0)
            self.fromStreets([]);
        if (self.toStreets().length > 0)
            self.toStreets([]);
    };

    self.getOnStreets = function(searchTerm, callback) {
        if (self.fromStreetCaption() != "Choose an 'On Street'...")
            self.fromStreetCaption("Choose an 'On Street'...");
        if (self.toStreetCaption() != "Choose an 'On Street'...")
            self.toStreets("Choose an 'On Street'...");

        self.clearFromAndToOa();

        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetOnStreets?onStreet=" + searchTerm,
        }).done(callback);
    };

    self.getFromStreets = function(onStreet) {
        if (onStreet == undefined)
            return;

        self.fromStreetCaption("Loading...");
        self.toStreetCaption("Choose a 'From/At Street'...");
        //var $ddFromStreet = $(".ddFromStreet");

        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetFromStreets?onStreet=" + onStreet,
            success: function(data) {
                self.fromStreets(data);
                self.fromStreetCaption("Choose...");
            },
            error: function(event, jqXhr, ajaxSettings, thrownError) {
                self.fromStreetCaption("Choose an 'On Street'...");
                self.toStreetCaption("Choose an 'On Street'...");
                self.clearFromAndToOa();
            }
        });
    };

    self.prepToStreet = function(fromStreet, onStreet) {
        self.toStreetCaption("Processing...");

        if (ko.utils.unwrapObservable(onStreet) == undefined || ko.utils.unwrapObservable(fromStreet) == undefined) {

            if (self.toStreets().length > 0)
                self.toStreets([]);

            if (ko.utils.unwrapObservable(onStreet) == undefined && self.toStreetCaption() != "Choose an 'On Street'...")
                self.toStreets("Choose an 'On Street'...");

            if (ko.utils.unwrapObservable(onStreet) != undefined && fromStreet == undefined && self.toStreetCaption() != "Choose a 'From/At Street'...")
                self.toStreetCaption("Choose a 'From/At Street'...");

            return;
        }
    };
    self.getToStreets = function(onStreet, fromStreet) {


        try {
            console.log("setting onStreet...");
            onStreet = onStreet();
            console.log("onStreet set to " + onStreet);
        } catch (e) {
            console.log("onStreet: " + e);
            console.log(ko.toJSON(onStreet));
            return;
        }

        var fromNodeNumber;

        try {
            console.log("setting fromNodeNumber...");
            fromNodeNumber = fromStreet().NodeOrder;
            console.log("fromNodeOrder set to " + fromNodeNumber);
            console.log("setting fromStreet...");
            fromStreet = fromStreet().st_name.trim();
            console.log("fromStreet set to " + fromStreet);
        } catch (e) {

            console.log("fromStreetError: " + e);
            console.log(ko.toJSON(fromStreet));
            return;
        }


        self.toStreetCaption("Loading...");
        var $ddToStreet = $(".ddToStreet");

        //fromStreet = ko.unwrap(fromStreet.st_name)[0].st_name.trim();
        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetToStreets?onStreet=" + onStreet + "&fromStreet=" + fromStreet + "&trimLeadingNumbers=false&fromNodeNumber=" + fromNodeNumber,
            success: function(data) {
                if (data.length > 0) {
                    self.toStreetCaption("Choose...");
                    self.toStreets(data);

                    $ddToStreet.focus();
                } else {
                    self.toStreetCaption("No segments left...");
                    if (self.toStreets().length > 0)
                        self.toStreets([]);

                }
            },
            error: function(event, jqXhr, ajaxSettings, thrownError) {
                console.log("getToStreet: " + thrownError);
            }
        });


    };

    self.getFromAndToStreetNames = function(searchTerm, callback) {
        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetCrossStreets?streetCode=" + self.streetCode + "&searchTerm=" + searchTerm,
        }).done(callback);
    };

    //** permits
    self.addPermit = function(permit) {
        if (permit.PermitId == undefined) {
            permit = new Permit();
            // begin editing the new item straight away
            self.editPermit(permit);
        }

        self.permits.push(permit);
    };

    self.removePermit = function(permit) {
        if (self.editingItem() == null) {
            var answer = confirm("Are you sure you want to delete this permit?");
            if (answer) {
                self.permits.remove(permit);
            }
        }
    };

    self.editPermit = function(permit) {
        if (self.editingItem() == null) {
            // start the transaction
            permit.beginEdit(self.editPermitTransaction);

            // shows the edit fields
            self.editingItem(permit);
        }
    };

    self.applyPermit = function(permit, event) {
        //  commit the edit transaction
        permit.PermitStatus.editValue("Pending");
        self.editPermitTransaction.notifySubscribers(null, "commit");

        var $status = $(event.target).parent().prev(".ClosureStatus");
        var bcCss = $status.css("background-color");
        $status.css("backgroundColor", "#00FA9A");
        $status.animate({ "backgroundColor": bcCss }, 300);

        $(event.target).parent().find(".edit-button").remove();

        //  hides the edit fields
        self.editingItem(null);
    };

    self.cancelEditPermit = function() {
        //  reject the edit transaction
        self.editPermitTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.createPermit = function() {

    };

    self.updatePermit = function() {
        $.ajax({
            url: self.apiUrl + "api/permits/CreatePermit",
            data: JSON.stringify({ permits: this.permits }),
            type: 'POST',

            success: function() {
                $.notify(notification.recordSaved, "success");
            },
            error: function() {
                $.notify(notification.recordNotSaved, "error");
            }
        });
    };

    self.getPermitsForCompany = function(paging) {
        /// <summary>
        ///     Gets a list of permits for a company
        /// </summary>
        var $loadingIndicator = $('#loading-indicator');
        $loadingIndicator.show();

        var searchText = self.permitSearch() + self.permitSearch() != "" ? "&search=" + self.permitSearch() : "";

        var page = "";
        if (paging) page = "&page=" + self.currentPermitPage;

        var statusFilter = "&statusCode=";

        statusFilter += self.selectedStatusCode() == undefined ? "1" : self.selectedStatusCode().StatusId;

        var companyFilter = "";
        try {
            companyFilter = self.selectedCompany().CompanyId() == undefined ? "" : "&companyId=" + self.selectedCompany().CompanyId();
        } catch (e) {
            console.log(e);
            return;
        }

        if (companyFilter == "" || companyFilter == undefined) return;


        var pageSizeFilter = self.selectedPageSize() != undefined ? "&pageSize=" + self.selectedPageSize() : "";

        self.filter = pageSizeFilter + "&filter=" + self.radioSearchSelectedOptionValue() + "&sort=" + self.sort + "&sortDir=" + self.sortDir + searchText + page + statusFilter + companyFilter;

        $loadingIndicator.show();
        $.ajax({
            url: self.apiUrl + "api/permits/GetPermitByCompanyId?token="
                + getUrlParameter("token") + self.filter,
            contentType: "application/json; charset=utf-8",
            success: function(result) {
                self.totalPermitsFound(result.TotalPermits);
                self.permits([]);
                $("#page-selection").bootpag({
                    total: result.TotalPages + 1,
                    page: result.CurrentPage,
                    maxVisible: result.TotalPages < 5 ? result.TotalPages : 5,
                    leaps: true,
                    firstLastUse: result.TotalPages > 5 ? true : false,
                    first: '←',
                    last: '→',
                });

                if (self.sortDir == "desc" && result.Permits != undefined) {
                    for (var i = result.Permits.length - 1; i >= 0; i--) {
                        if (result.Permits[i].StartDate != undefined) result.Permits[i].StartDate = result.Permits[i].StartDate.substr(0, 10);
                        if (result.Permits[i].EndDate != undefined) result.Permits[i].EndDate = result.Permits[i].EndDate.substr(0, 10);

                        var permit = new Permit(result.Permits[i].PermitId, result.Permits[i].Purpose, result.Permits[i].PermitLocation, result.Permits[i].StartDate, result.Permits[i].EndDate, result.Permits[i].PermitStatus);

                        self.addPermit(permit);
                    }
                } else {
                    $(result.Permits).each(function(index, item) {
                        if (item.StartDate != undefined) item.StartDate = item.StartDate.substr(0, 10);
                        if (item.EndDate != undefined) item.EndDate = item.EndDate.substr(0, 10);

                        self.addPermit(new Permit(item.PermitId, item.Purpose, item.PermitLocation, item.StartDate, item.EndDate, item.PermitStatus));
                    });
                }
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });

        $loadingIndicator.hide();
        $("#loading-table").hide();
    };

    self.downloadPermitPdf = function(permit) {
        window.open(self.apiUrl + "api/Permits/GetPermitPdf.pdf?token=" + getUrlParameter("token") + "&permitId=" + permit.PermitId(), "Download Permit " + permit.PermitId());
    };

    self.requestPermitCancellation = function(permit, event) {
        var answer = confirm("Are you sure you want to request that Permit " + permit.PermitId() + " be canceled?");
        if (answer) {
            permit.PermitStatus("Pending Cancellation");
            //self.editPermitTransaction.notifySubscribers(null, "commit");

            var $status = $(event.target).parent().prev(".ClosureStatus");
            var bcCss = $status.css("background-color");
            $status.css("backgroundColor", "#00FA9A");
            $status.animate({ "backgroundColor": bcCss }, 300);

            $(event.target).parent().find(".edit-button").remove();
            $(event.target).parent().find(".cancel-button").remove();
        }
    };

    self.sortPermits = function(data) {
        self.sortDir = self.sortDir === "asc" ? "desc" : "asc";
        self.sort = data;
        self.getPermitsForCompany();
    };

    // new permit application actions
    self.cancelPermitApplication = function() {
        // ToDo: clear new permit application model values
        var answer = confirm(notification.cancelNewPermitConfirm);
        if (answer) {
            $.notify(notification.cancelNewPermitSuccess, "info");
            self.showMainSections();
            self.resetNewPermitFields();
        }
    };

    self.savePermitApplicationDraft = function() {
        // ToDo: submit permit application draft
        $.notify(notification.savePermitAppDraftSuccess, "success");
        self.showMainSections();
    };

    self.submitPermitApplication = function() {
        // ToDo: submit permit application
        self.postPermit(false);
    };

    self.submitPermitDraftApplication = function() {
        self.postPermit(true);
    };

    self.postPermit = function(isDraft) {
        var prams = "?token=" + getUrlParameter("token") +
            "&companyId=" + self.selectedCompany().CompanyId() +
            "&utilityOwnerId=" + self.selectedUtilityOwner().OwnerId +
            "&permitTypeId=" + self.selectedPermitType().PermitTypeId +
            "&projectTypes=" + self.selectedProjectTypes.binary2Decimal() +
            "&encroachmentTypes=" + ko.toJSON(self.selectedEncroachmentTypes) +
            "&effectiveDate=" + self.effectiveDate() +
            "&expirationDate=" + self.expirationDate() +
            "&timeOfWork=" + self.timeOfWork() +
            "&purpose=" + self.purpose() +
            "&comments=" + self.comments() +
            "&isDraft=" + isDraft;
        //});


        $.ajax({
            url: self.apiUrl + "api/permits/CreatePermit" + prams,

            type: 'POST',
            success: function() {
                $.notify(notification.submitNewAppSuccess, "success");
                self.showMainSections();
                self.resetNewPermitFields();
            },
            error: function() {
                $.notify(notification.recordNotSaved, "error");
            }
        });
    };

    self.resetNewPermitFields = function() {
        self.selectedUtilityOwner(null);
        self.selectedPermitType(null);
        self.selectedProjectTypes.projectTypes([]);
        self.selectedEncroachmentTypes([]);
        self.effectiveDate(null);
        self.expirationDate(null);
        self.purpose(null);
        self.timeOfWork(null);
        self.comments(null);
        self.locations([]);
        self.referenceTypes([]);
    };

    //** references
    self.addReference = function(reference) {
        if (reference.ReferenceTypeId == undefined)
            reference = new Reference();

        self.references.push(reference);

        //  begin editing the new item straight away
        self.editReference(reference);
    };

    self.removeReference = function(reference) {
        if (self.editingReferenceItem() == null) {
            var answer = confirm("Are you sure you want to delete this reference?");
            if (answer) {
                self.references.remove(reference);
            }
        }
    };

    self.editReference = function(reference) {
        if (self.editingReferenceItem() == null) {
            // start the transaction
            reference.beginEdit(self.editReferenceTransaction);

            // shows the edit fields
            self.editingReferenceItem(reference);
        }
    };

    self.applyReference = function() {
        //  commit the edit transaction
        self.editReferenceTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingReferenceItem(null);
    };

    self.cancelEditReference = function() {
        //  reject the edit transaction
        self.editReferenceTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingReferenceItem(null);
    };

    //** login
    self.requestLogin = function() {
        if (!ko.validation.validateObservable(self.usersEmailAddress))
            return false;

        var $Loading = $("#Loading");
        var $RequestLoginBtn = $("#RequestLoginBtn");
        $RequestLoginBtn.after($Loading);
        $Loading.show();
        $RequestLoginBtn.val("sending request...");
        $RequestLoginBtn.prop('disabled', true);
        $.ajax({
            type: "POST",
            url: self.apiUrl + "api/authentication/authenticate?emailAddress=" + self.usersEmailAddress(),
            success: function() {
                $("#LoginMain").html(notification.checkLoginEmail);
                $Loading.hide();
            },
            error: function() { //}xhr, ajaxOptions, thrownError) {
                $RequestLoginBtn.notify(notification.errorSendingSecToken, "error",
                    { position: "right" }
                );
                $Loading.hide();
                $RequestLoginBtn.prop('disabled', false);
                $RequestLoginBtn.val("request login email");
            }
        });
        return true;
    };

    //** roles
    self.getRoles = function() {
        $.ajax({
            type: "GET",
            url: self.apiUrl + "api/contacts/GetRoles",
            success: function(data) {
                self.contactRoles(data);
            },
            //error: function (xhr, ajaxOptions, thrownError) {
            //    //ToDo: handle error
            //}
        });
    };

    //** documents
    self.addDocument = function() {
        var boundary = (new Date()).getTime();
        $("#UploadDocumentProgress").show();
        $.ajax({
            url: self.apiUrl + "api/files/",
            type: 'POST',
            data: $('#fileInput')[0], // The form with the file inputs.
            processData: false, // Using FormData, no need to process data.
            contentType: false,
            headers: {
                "Content-Type": "multipart/form-data; boundary=" + "---------------------------" + boundary,
                "Content-Length": $("#fileInput")[0].length
            }
        }).done(function() {
            $.notify("Document uploaded.", "success");
        }).fail(function() {
            $.notify("An error occurred, the files couldn't be sent!", "error");
        });

        $("#UploadDocumentProgress").hide();
    };

    //** status codes
    self.getStatusCodes = function() {
        //console.log(ko.toJSON(self.selectedCompany));

        if (self.selectedCompany().CompanyId() == undefined)
            return;

        $.ajax({
            type: "GET",
            url: self.apiUrl + "api/permits/GetStatusSummaryByCompanyId?token=" + getUrlParameter("token") + "&companyId=" + self.selectedCompany().CompanyId(),
            success: function(data) {
                self.permitStatusCodes([]);
                $(data).each(function(index, item) {
                    var s = new PermitStatus(item.StatusCodeId, item.StatusCodeName, item.TotalPermits);
                    self.permitStatusCodes.push(s);
                });

                $("button:contains('Approved')").css("border", "black solid 3px");
            },
            //error: function (xhr, ajaxOptions, thrownError) {
            //    //ToDo: handle error
            //}
        });
    };

    self.selectStatusCode = function(data, event) {
        //console.log(event.target);
        $(".status-button").css("border", "none");
        if (!$(event.target).hasClass("status-button")) {
            $(event.target).parent(".status-button").css("border", "black solid 3px");
        } else {
            //console.log("else");
            $(event.target).css("border", "black solid 3px");
        }

        self.selectedStatusCode(data);
        $("#loading-table").show();
        self.getPermitsForCompany();
    };

    //** nav
    self.showNewPermitSection = function() {
        $("#LoginSection").hide();
        $("#AccountSection").hide();
        $("#YourPermitsSection").hide();
        $("#UsersCompaniesSection").hide();

        $("#AddNewPermitSection").show();

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    self.cancelNewPermit = function() {
        $("#AddNewPermitSection").hide();

        $("#LoginSection").hide();
        $("#LoginSection").show();
        $("#AccountSection").show();
        $("#YourPermitsSection").show();

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    self.showMainSections = function() {
        $("#loading-table").show();
        self.getStatusCodes();
        self.getPermitsForCompany();
        $("#LoginSection").hide();
        $("#AddNewPermitSection").hide();

        $("#UserDetailsSection").show();
        $("#AccountSection").show();
        $("#YourPermitsSection").show();

        if (self.companies().length > 1)
            $("#UsersCompaniesSection").show();

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    self.showUsersCompaniesSection = function() {
        $("#YourPermitsSection").hide();
        $("#LoginSection").hide();
        $("#UserDetailsSection").hide();
        $("#AccountSection").hide();

        $("#UsersCompaniesSection").show();

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    //** view model data
    self.getViewModelData = function() {
        $.ajax({
            url: self.apiUrl + "api/permits/GetStreetClosureViewModelData?token=" + getUrlParameter("token"),
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                //console.log(data);
                // users company details => self.getUsersCompanies();
                if (data.UsersCompanyViewModel.length == 1) {
                    var company = new Company(
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.CompanyId,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.CompanyName,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.CompanyPhoneNumber,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.CompanyFaxNumber,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.Website,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.BillingStreetAddress1,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.BillingStreetAddress2,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.BillingStreetAddress3,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.BillingCity,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.BillingState,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.BillingZipCode,
                        data.UsersCompanyViewModel[0].CompanyDetailsVm.PhiladelphiaTaxId
                    );
                    self.addCompany(company);
                    self.selectedCompany(company);
                    $("#loading-table").show();
                    self.showMainSections();
                    $("#UsersCompaniesSection").hide();
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                } else {
                    $(data.UsersCompanyViewModel).each(function(index, item) {
                        self.addCompany(new Company(item.CompanyDetailsVm.CompanyId,
                            item.CompanyDetailsVm.CompanyName,
                            item.CompanyDetailsVm.CompanyPhoneNumber,
                            item.CompanyDetailsVm.CompanyFaxNumber,
                            item.CompanyDetailsVm.Website,
                            item.CompanyDetailsVm.BillingStreetAddress1,
                            item.CompanyDetailsVm.BillingStreetAddraess2,
                            item.CompanyDetailsVm.BillingStreetAddress3,
                            item.CompanyDetailsVm.BillingCity,
                            item.CompanyDetailsVm.BillingState,
                            item.CompanyDetailsVm.BillingZipCode,
                            item.CompanyDetailsVm.PhiladelphiaTaxId));
                    });
                }

                // self.getProjectTypes();
                self.projectTypes(data.ProjectTypes);

                //self.getReferenceTypes();
                $(data.ReferenceTypes).each(function(index, item) {
                    self.referenceTypes.push(new Reference(item.ReferenceTypeID, item.ReferenceTypeName, null));
                });

                //self.getEncroachmentTypes();
                self.encroachmentTypes(data.EncroachmentTypes);

                //self.getPermitTypes();
                self.permitTypes(data.PermitTypeVms);

                //self.getUtilityOwners();
                self.utilityOwners(data.UtilityOwners);

                //self.getOccupancyTypes();
                self.occupancyTypes(data.OccupancyTypes);

                $("#PageLoadingProgress").hide();

                if (data.UsersCompanyViewModel.length > 1) {
                    self.showUsersCompaniesSection();
                }
            },
            //error: function (xhr, ajaxOptions, thrownError) {
            //}
        });

    };

    //** required support for the PSD's legacy code
    //self.selectedProjectTypes = ko.observableArray();

    //self.sortProjectTypes = function() {
    //    return self.sortProjectTypes.sort(function(a, b) { return a - b; });
    //};

    //self.projectTypesToBinary = function() {
    //    var a = [];
    //    for (var i = 0; i < self.projectTypes().length; i++)
    //        a.push("0");

    //    for (var j = 0; j < self.selectedProjectTypes().length; j++)
    //        a[parseInt(self.selectedProjectTypes()[j]) - 1] = "1";

    //    var b = "";

    //    for (var k = 0; k < a.length; k++)
    //        b += a[k];

    //    return b;
    //};

    //self.projectTypesBinToDecimal = function(bin) {
    //    return parseInt(bin, 2);
    //};


    self.selectedProjectTypes =
    {
        projectTypes: ko.observableArray(),
        sort: function() {
            this.projectTypes(this.projectTypes.sort(function(a, b) { return a - b; }));
        },
        toBinary: function() {
            var a = [];
            for (var i = 0; i < self.projectTypes().length; i++)
                a.push("0");

            for (var j = 0; j < this.projectTypes().length; j++)
                a[parseInt(this.projectTypes()[j]) - 1] = "1";

            var b = "";

            for (var k = 0; k < a.length; k++)
                b += a[k];

            return b;
        },
        binary2Decimal: function() {
            return parseInt(this.toBinary(), 2);
        },
        decimal2Binary: function(dec) {
            var bin = (dec >>> 0).toString(2);
            var len = bin.length;
            var dif = self.projectTypes().length - len;
            for (var i = 0; i < dif; i++)
                bin = "0" + bin;

            return bin;
        }
    };


};

/*----------------------------------------------------------------------*/
/* KO Page Binding                                                      */
/*----------------------------------------------------------------------*/
$(document).ready(function() {
    //  create the model
    var model = new AppViewModel();

    ko.applyBindings(model, document.getElementById("page"));

    var token = getUrlParameter("token");

    if (token != undefined) {

        model.getViewModelData();

        //$(':file').change(function () {
        //    //var file = this.files[0];
        //    //var name = file.name;
        //    //var size = file.size;
        //    //var type = file.type;
        //    // ToDo: validation
        //});

        $('#page-selection').bootpag({
            total: 1,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, num) {
            model.currentPermitPage = num;
            try {
                $("#loading-table").show();
                model.getPermitsForCompany(true);
            } catch (e) {
                //console.log("paging error: " + e);
            }
        });

        //var now = new Date();
        //now = now.addDays(10);

        ////if($("#RefStart")[0].type != "date")
        ////    $("#RefStart").datepicker();

        //var day = now.getDate();
        //day = day < 10 ? "0" + day : day
        //var month = (now.getMonth() + 1);
        //month = month < 10 ? "0" + month : month;
        //var year = now.getFullYear();
        //var minDate = year + "-" + month + "-" + day;

        //console.log(minDate);

        //document.getElementById("RefStart").min = "1999-01-01";
        //var x = document.getElementById("RefStart").min = "1999-01-01";

        //$("#RefStart").attr("min", minDate);
        //$("#RefStart").attr("max", minDate);

        //document.getElementById("RefStart").min = minDate;

        //// ToDo: make the start and end dates observable
        $("#ReqStart").datepicker({
            format: "mm/dd/yyyy",
            startDate: "+10d",
            autoclose: true
        }).on("changeDate", function(e) {
            $(this).datepicker("hide");

            var today = new Date();
            $("#ReqEnd").val("");

            $("#ReqEnd").datepicker("remove");

            $("#ReqEnd").datepicker({
                format: "mm/dd/yyyy",
                startDate: "+" + today.dayDiff(e.date) + "d",
                autoclose: true
            }).on("changeDate", function() { //e) {
                $(this).datepicker("hide");
            });
        });

        $("#ReqEnd").datepicker({
            format: "mm/dd/yyyy",
            startDate: "+10d",
            autoclose: true
        });
    } else {
        $("#LoginSection").show();
        $("#PageLoadingProgress").hide();
    }
    ko.validation.init({
        decorateElement: true,
        messagesOnModified: true, // Show straight away
    });

    $(".resize tr th").resizable({
        handles: "e"
    });

    $(document).ajaxStart(function() {
        $('.mask').addClass('ajax');
    });
    $(document).ajaxComplete(function() {
        $('.mask').removeClass('ajax');
    });

    loadMap();

});







getUrlParameter = function(sParam) {
    var sPageUrl = window.location.search.substring(1);
    var sUrlVariables = sPageUrl.split('&');
    for (var i = 0; i < sUrlVariables.length; i++) {
        var sParameterName = sUrlVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return null;
};

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + (days - 1));
    return date;
};

Date.prototype.dayDiff = function(day) {
    var date = new Date(this.valueOf());
    return Math.round((day - date) / (1000 * 60 * 60 * 24)) + 1;
};