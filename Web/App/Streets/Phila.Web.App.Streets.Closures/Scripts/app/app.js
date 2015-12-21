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
/// <reference path="~/Scripts/jquery.bootpag.min.js" />
/// <reference path="~/Scripts/jquery.responsiveTabs.js" />


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

    //self.newPermit = ko.observable(new Permit());

    self.streetSearch = ko.observable();

    // data used to populate the app
    self.permits = ko.observableArray();
    self.encroachmentTypes = ko.observableArray();
    self.referenceTypes = ko.observableArray();
    self.projectTypes = ko.observableArray();
    self.permitTypes = ko.observableArray();
    self.occupancyTypes = ko.observableArray();
    self.utilityOwners = ko.observableArray();
    self.selectedCompany = ko.observable("");
    self.isPermitLoading = ko.observable(false);

    // data for the login email
    self.usersEmailAddress = ko.observable().extend({ email: true, required: true });


    self.totalPermitsFound = ko.observable();
    self.apiUrl = "https://phila.azurewebsites.net/"; // "http://localhost/Phila.Web.Api.Streets/";//  
    self.streetCode = "";
    self.fromStreets = ko.observableArray();

    self.toStreets = ko.observableArray();
    self.locationTypes = ko.observableArray(["Address", "Intersection", "Street Segment"]);

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
    self.editingPermitItem = ko.observable();

    // create the transaction for commit and reject
    self.editTransaction = new ko.subscribable();
    self.editLocationTransaction = new ko.subscribable();
    self.editPermitTransaction = new ko.subscribable();
    self.editReferenceTransaction = new ko.subscribable();

    //*** helpers
    self.isContactEditing = function (item) {
        return item == self.editingItem();
    };
    self.isCompanyEditing = function (item) {
        return item == self.editingItem();
    };
    self.isLocationEditing = function (item) {
        return item == self.editingLocationItem();
    };
    self.isPermitEditing = function (item) {
        return item == self.editingPermitItem();
    };
    self.isReferenceEditing = function (item) {
        return item == self.editingReferenceItem();
    };

    //** subscriptions
    self.selectedCompanyChanged = function () {

        if (self.selectedCompany() === undefined) {
            self.showUsersCompaniesSection();
            return;
        }

        try {
            $("#loading-table").show();
            self.showMainSections();
        } catch (e) {
            //console.log("selectedCompany.subscribe error: " + e);
        }
    };


    //self.radioSearchSelectedOptionValue.subscribe(function () { //}(data, event) {
    //    $("#loading-table").show();
    //    self.getPermitsForCompany();

    //});

    //*** methods
    //** contacts
    self.addContact = function (contact) {
        if (!contact)
            contact = new Contact();

        self.contacts.push(contact);

        //  begin editing the new item straight away
        self.editContact(contact);
    };

    self.removeContact = function (contact) {
        if (self.editingItem() == null) {
            var answer = confirm("Are you sure you want to delete this contact?");
            if (answer) {
                self.contacts.remove(contact);
            }
        }
    };

    self.editContact = function (contact) {
        if (self.editingItem() == null) {
            // start the transaction
            contact.beginEdit(self.editTransaction);

            // shows the edit fields
            self.editingItem(contact);
        }
    };

    self.applyContact = function () {
        //  commit the edit transaction
        self.editTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.cancelEditContact = function () {
        //  reject the edit transaction
        self.editTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.selectContact = function (contact) {
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

    self.addCompany = function (company) {
        if (!company)
            company = new Company();

        self.companies.push(company);

        //  begin editing the new item straight away
        //self.editCompany(company);
    };

    self.removeCompany = function (company) {
        if (self.editingItem() == null) {
            var answer = confirm("Are you sure you want to delete this company?");
            if (answer) {
                self.companies.remove(company);
            }
        }
    };

    self.editCompany = function (company) {
        if (self.editingItem() == null) {
            // start the transaction
            company.beginEdit(self.editTransaction);

            // shows the edit fields
            self.editingItem(company);
        }
    };

    self.applyCompany = function () {
        //  commit the edit transaction
        self.editTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.cancelEditCompany = function () {
        //  reject the edit transaction
        self.editTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingItem(null);
    };

    self.requestCompanyInfoUpdate = function () {
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: self.apiUrl + "api/companies/UpdateCompanyInfo?&token=" + getUrlParameter("token"),
            data: ko.toJSON(self.selectedCompany.edit),
            success: function () {
                $("#AccountDetailsEdit").hide();
                $("#AccountDetails").show();

                $.notify(notification.success, { className: "success", globalPosition: "top left" });
            },
            error: function () { //(xhr, ajaxOptions, thrownError) {
                $.notify(notification.error, { className: "info", globalPosition: "top left" });
            }
        });
    };

    self.getUsersCompanies = function () {
        $.ajax({
            url: self.apiUrl + "api/companies/GetUsersCompanies?token=" + getUrlParameter("token"),
            contentType: "application/json; charset=utf-8",
            success: function (data) {
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
                    $(data).each(function (index, item) {
                        self.addCompany(new Company(item.CompanyId, item.CompanyName, item.CompanyPhoneNumber, item.CompanyFaxNumber, item.Website, item.BillingStreetAddress1, item.BillingStreetAddraess2, item.BillingStreetAddress3, item.BillingCity, item.BillingState, item.BillingZipCode, item.PhiladelphiaTaxId));
                    });

                    self.showUsersCompaniesSection();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //console.log(xhr, ajaxOptions, thrownError);
            }
        });
    };

    //** locations
    self.addLocation = function (location) {
        if (location == undefined || location.ToStreet == undefined) {
            location = new PostedLocation();
            
        }

        location.OccupancyTypeId.editValue.subscribe(function (data) {
            self.validateLocation();
        });

        location.LocationType.editValue.subscribe(function (data) {
            self.validateLocation();
        });


        location.OnStreetName.editValue.subscribe(function (data) {
            self.validateLocation();
            self.getFromStreets(data.trim());
        });

        location.FromStreetName.editValue.subscribe(function (data) {
            self.validateLocation();
        });

        location.ToStreetName.editValue.subscribe(function (data) {
            self.validateLocation();
        });


        self.fromStreetCaption("Choose an 'On Street'...");
        self.toStreetCaption("Choose an 'On Street'...");
        self.clearFromAndToOa();
        //self.selectedLocation(location);
        self.editingPermitItem().Locations.push(location);

        //  begin editing the new item straight away
        self.editLocation(location);

        //console.log(ko.toJSON(location));

    };

    self.commitLocation = function() {
        //  commit the edit transaction
        self.editLocationTransaction.notifySubscribers(null, "commit");
        
        //  hides the edit fields
        self.editingLocationItem(null);
    }

    self.removeLocation = function (location) {

        //if (self.editingLocationItem() == null) {
            var answer = confirm("'Are you sure you want to delete this location?");
            if (answer) {
                if (location.IsNewLocation() == true) {
                    self.commitLocation();
                }

                self.editingPermitItem().Locations.remove(location);
            }
        //}
    };

    self.editLocation = function (location) {
        if (self.editingLocationItem() == null) {

            //console.log(ko.toJSON(location));

            self.clearFromAndToOa();

            if (location.OnStreetName() != undefined) {
                self.getFromStreets(location.OnStreetName());
            }

            //if (location.FromStreet().st_name != "blank")
            //    location.FromStreet.editValue(location.FromStreet());

            // start the transaction
            location.beginEdit(self.editLocationTransaction);

            //self.selectedLocation(location);

            //location.IsLocationEditing(true);

            // shows the edit fields
            self.editingLocationItem(location);

            
        }
    };

    //self.isOccupancyTypeValid = ko.observable(false);
    //self.isLocationTypeValid = ko.observable(false);
    //self.isOnStreetValid = ko.observable(false);
    //self.isFromStreetValid = ko.observable(false);
    //self.isToStreetValid = ko.observable(false);

    self.validateLocation = function() {
        var isLocValid = true;

        var eli = self.editingLocationItem();

        if (eli == undefined || eli == null) {
        //    eli.isOccupancyTypeValid(false);
        //    eli.isLocationTypeValid(false);
        //    eli.isOnStreetValid(false);
        //    eli.isToStreetValid(false);
            return false;
        }

        //if (eli.IsLocationEditing() == false) {
        //    return true;
        //}

        var ot = eli.OccupancyTypeId.editValue();
        if (ot != undefined) {
            ot = ot.OccupancyTypeName;
            console.log(ot);
            eli.isOccupancyTypeValid(true);
        } else {
            isLocValid = false;
            eli.isOccupancyTypeValid(false);
        }

        var lt = eli.LocationType.editValue();
        if (lt != undefined) {
            console.log(lt);
            eli.isLocationTypeValid(true);
        } else {
            isLocValid = false;
            eli.isLocationTypeValid(false);
        }

        var os = eli.OnStreetName.editValue();
        console.log("OnStreetName", os);
        if (os != undefined && os != "") {
            console.log("OnStreetName", os);
            eli.isOnStreetValid(true);
        } else {
            isLocValid = false;
            eli.isOnStreetValid(false);
        }

        if (lt != undefined && lt != "Address") {
            var fs = eli.FromStreetName.editValue();
            if (fs != undefined) {
                fs = fs.StreetName;
                console.log(fs);
                eli.isFromStreetValid(true);
            } else {
                isLocValid = false;
                eli.isFromStreetValid(false);
            }

            if (lt == "Street Segment") {
                var ts = eli.ToStreetName.editValue();

                if (ts != undefined) {
                    console.log(ts);
                    eli.isToStreetValid(true);
                } else {
                    isLocValid = false;
                    eli.isToStreetValid(false);
                }
            }
        } else {
            eli.isFromStreetValid(true);
            eli.isToStreetValid(true);
        }

        return isLocValid;
    }

    self.applyLocation = function () {

        if (!self.validateLocation()) {
            return;
        }

        var eli = self.editingLocationItem();
        if (eli.IsNewLocation() == true) {
            eli.IsNewLocation(false);
        }
        //self.editingLocationItem.IsLocationEditing(false);
        self.commitLocation();
    };

    self.cancelEditLocation = function () {


        //  reject the edit transaction
        self.editLocationTransaction.notifySubscribers(null, "rollback");

        //self.editingLocationItem.IsLocationEditing(false);
        
        //  hides the edit fields
        self.editingLocationItem(null);
    };

    self.clearFromAndToOa = function () {
        if (self.fromStreets().length > 0)
            self.fromStreets([]);
        if (self.toStreets().length > 0)
            self.toStreets([]);

        if (self.fromStreetCaption() !== "Choose an 'On Street'...")
            self.fromStreetCaption("Choose an 'On Street'...");
        if (self.toStreetCaption() !== "Choose an 'On Street'...")
            self.toStreetCaption("Choose an 'On Street'...");
    };

    self.getOnStreets = function (searchTerm, callback) {
        if (self.fromStreetCaption() !== "Choose an 'On Street'...")
            self.fromStreetCaption("Choose an 'On Street'...");
        if (self.toStreetCaption() !== "Choose an 'On Street'...")
            self.toStreetCaption("Choose an 'On Street'...");

        //self.clearFromAndToOa();

        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetOnStreets?onStreet=" + searchTerm,
        }).done(callback);
    };

    self.getFromStreets = function (onStreet) {
        if (onStreet === "") {

            self.clearFromAndToOa();
            return;
        }

        self.fromStreetCaption("Loading...");
        self.toStreetCaption("Choose a 'From Street'...");

        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetFromStreets?onStreet=" + onStreet,
            success: function (data) {
                //console.log("fromStreet", data);
                self.fromStreets(data);
                //self.fromStreets([]);
                //$(data).each(function(index, item) {
                //    fromStreets.push(new PermitLocation())
                //});

                self.fromStreetCaption("Choose...");
            },
            error: function (event, jqXhr, ajaxSettings, thrownError) {
                self.fromStreetCaption("Choose an 'On Street'...");
                self.toStreetCaption("Choose an 'On Street'...");
                self.clearFromAndToOa();
                $.notify("Invalid location", { className: "error", globalPosition: "top left" });
            }
        });
    };

    self.prepToStreet = function (fromStreet, onStreet) {
        self.toStreetCaption("Processing...");

        if (ko.utils.unwrapObservable(onStreet) == undefined || ko.utils.unwrapObservable(fromStreet) == undefined) {

            if (self.toStreets().length > 0)
                self.toStreets([]);

            if (ko.utils.unwrapObservable(onStreet) == undefined && self.toStreetCaption() !== "Choose an 'On Street'...")
                self.toStreetCaption("Choose an 'On Street'...");

            if (ko.utils.unwrapObservable(onStreet) != undefined && fromStreet == undefined && self.toStreetCaption() !== "Choose a 'From Street'...")
                self.toStreetCaption("Choose a 'From Street'...");

            return;
        }
    };
    self.getToStreets = function (onStreet, fromStreet) {

        try {
            //console.log("setting onStreet...");
            onStreet = onStreet();
            //console.log("onStreet set to " + onStreet);
        } catch (e) {
            console.log("onStreet: " + e);
            console.log(ko.toJSON(onStreet));
            return;
        }


        if (fromStreet() == undefined) {
            self.toStreetCaption("Choose a 'From Street'...");

            self.toStreets([]);
            return;
        }


        var fromNodeNumber;

        //try {


        //console.log("setting fromNodeNumber...");
        fromNodeNumber = fromStreet().NodeOrder;
        //console.log("fromNodeOrder set to " + fromNodeNumber);
        //console.log("setting fromStreet...");
        fromStreet = fromStreet().StreetName.trim();
        //console.log("fromStreet set to " + fromStreet);

        // } catch (e) {

        //     console.log("fromStreetError: " + e);
        //     console.log(ko.toJSON(fromStreet));
        //     return;
        //}


        self.toStreetCaption("Loading...");
        var $ddToStreet = $(".ddToStreet");

        //fromStreet = ko.unwrap(fromStreet.st_name)[0].st_name.trim();
        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetToStreets?onStreet=" + onStreet + "&fromStreet=" + fromStreet + "&trimLeadingNumbers=false&fromNodeNumber=" + fromNodeNumber,
            success: function (data) {
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
            error: function (event, jqXhr, ajaxSettings, thrownError) {
                console.log("getToStreet: " + thrownError);
            }
        });


    };

    self.getFromAndToStreetNames = function (searchTerm, callback) {
        $.ajax({
            dataType: "json",
            type: "GET",
            url: self.apiUrl + "api/locations/GetCrossStreets?streetCode=" + self.streetCode + "&searchTerm=" + searchTerm,
        }).done(callback);
    };

    //** permits

    self.isPermitNew = ko.observable();
    self.addPermit = function (permit) {
        //$("#submitDraft").text("Save Draft");

        if (permit.PermitNumber == undefined) {
            permit = new Permit();
            // begin editing the new item straight away
            self.editPermit(permit, true);
        }

        //self.permits.push(permit);
        //self.showNewPermitSection();
    };

    self.removePermit = function (permit) {
        if (self.editingPermitItem() == null) {
            var answer = confirm("Are you sure you want to delete this permit?");
            if (answer) {
                self.submitPermitCancellation(permit, true, true);
                self.permits.remove(permit);
            }
        }
    };

    self.editPermit = function (permit, isNew) {


        // $("#btnSubmitDraft").prop("value", "Update Draft");

        if (self.editingPermitItem() == null || self.editingPermitItem() == undefined) {
            // start the transaction
            //permit.setShortDatesAndTimes();
            //permit.beginEdit(self.editPermitTransaction);

            // shows the edit fields
            self.editingPermitItem(permit);
            //console.log(ko.toJSON(permit.StartDate.editValue));
            //console.log(ko.toJSON(self.editingPermitItem().StartDate));

            self.showNewPermitSection();

            if (isNew === true) {
                self.isPermitNew(true);

                //document.getElementById("submitDraft").text = "Save Draft";
                //document.getElementById("cancelApp").text = "Delete App";

            } else {
                self.isPermitNew(false);

                //document.getElementById("submitDraft").text = "Update Draft";
                //document.getElementById("cancelApp").text = "Cancel Changes";

            }
        }
    };

    self.applyPermit = function (permit, event) {
        //  commit the edit transaction
        //permit.PermitStatus.editValue("Pending");
        //self.editPermitTransaction.notifySubscribers(null, "commit");

        //var $status = $(event.target).parent().prev(".ClosureStatus");
        //var bcCss = $status.css("background-color");
        //$status.css("backgroundColor", "#00FA9A");
        //$status.animate({ "backgroundColor": bcCss }, 300);

        //$(event.target).parent().find(".edit-button").remove();

        //  hides the edit fields
        self.editingPermitItem(null);
    };

    self.cancelEditPermit = function () {
        //  reject the edit transaction
        //self.editPermitTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingPermitItem(null);
    };

    self.getPermitsForCompany = function (paging) {
        /// <summary>
        ///     Gets a list of permits for a company
        /// </summary>
        //var $loadingIndicator = $("#loading-indicator");
        //$loadingIndicator.show();

        // clear the permits observableArray
        self.permits([]);
        // show loading image
        self.isPermitLoading(true);

        var searchText = self.permitSearch() + self.permitSearch() !== "" ? "&search=" + self.permitSearch() : "";

        var page = "";
        if (paging) page = "&page=" + self.currentPermitPage;

        var statusFilter = "&statusCode=";

        statusFilter += self.selectedStatusCode() == undefined ? "1" : self.selectedStatusCode();

        var companyFilter = "";
        try {

            companyFilter = self.selectedCompany() == undefined || self.selectedCompany().CompanyId() == undefined ? "" : "&companyId=" + self.selectedCompany().CompanyId();
        } catch (e) {
            console.log(e);
            return;
        }

        if (companyFilter === "" || companyFilter == undefined) return;


        var pageSizeFilter = self.selectedPageSize() != undefined ? "&pageSize=" + self.selectedPageSize() : "";

        self.filter = pageSizeFilter + "&filter=" + self.radioSearchSelectedOptionValue() + "&sort=" + self.sort + "&sortDir=" + self.sortDir + searchText + page + statusFilter + companyFilter;

        //$loadingIndicator.show();
        var token = getUrlParameter("token");
        var pers = [];
        $.ajax({
            url: self.apiUrl + "api/permits/GetPermitByCompanyId?token="
                + getUrlParameter("token") + self.filter,
            contentType: "application/json; charset=utf-8",
            success: function (result) {
                self.totalPermitsFound(result.TotalPermits);

                $("#page-selection").bootpag({
                    total: result.TotalPages,
                    page: result.CurrentPage,
                    maxVisible: result.TotalPages < 5 ? result.TotalPages : 5,
                    leaps: true,
                    firstLastUse: result.TotalPages > 5 ? true : false,
                    first: '←',
                    last: '→',
                });

                if (self.sortDir === "desc" && result.Permits != undefined) {
                    for (var i = result.Permits.length - 1; i >= 0; i--) {
                        var refs = [];
                        var locs = [];
                        var projTypes = [];
                        // set references
                        $(result.Permits[i].References).each(function (ind, ref) {
                            var r = new Reference(setKoType(self.referenceTypes(), "ReferenceTypeId", ref.ReferenceTypeId), "", ref.ReferenceValue);
                            refs.push(r);
                        });

                        // set locations
                        $(result.Permits[i].Locations).each(function (ind, loc) {
                            //console.log(loc);
                            var locType = "";
                            if (loc.OnStreetCode != null && loc.FromStreetCode == null && loc.ToStreetCode == null)
                                locType = "Address";
                            else if (loc.OnStreetCode != null && loc.FromStreetCode != null && loc.ToStreetCode == null) {
                                locType = "Intersection";
                            } else if (loc.OnStreetCode != null && loc.FromStreetCode != null && loc.ToStreetCode != null) {
                                locType = "Street Segment";
                            }

                            var pl = new PostedLocation(loc.SequenceNumber, setKoType(self.occupancyTypes(), "OccupancyTypeID", loc.OccupancyTypeId), locType, loc.OnStreetName, loc.OnStreetCode, loc.FromStreetName, loc.FromStreetCode, loc.FromStreetNode, loc.ToStreetName, loc.ToStreetCode, loc.ToStreetNode, false);
                            locs.push(pl);
                        });

                        // set project types
                        var pt = decimal2Array(result.Permits[i].ProjectTypes, self.projectTypes().length);

                        //console.log(result.Permits[i].ProjectTypes, self.projectTypes().length);
                        //console.log(pt);

                        $(pt).each(function (ind, projType) {
                            projTypes.push(setKoType(self.projectTypes(), "ProjectTypeId", projType));
                        });

                        var permit = new Permit(token, result.Permits[i].PermitNumber, result.Permits[i].CompanyId, result.Permits[i].CompanyName, setKoType(self.utilityOwners(), "OwnerId", result.Permits[i].UtilityOwnerId), setKoType(self.permitTypes(), "PermitTypeId", result.Permits[i].PermitTypeId), pt, result.Permits[i].EncroachmentTypes, result.Permits[i].EffectiveDate, result.Permits[i].ExpirationDate, result.Permits[i].Purpose, result.Permits[i].Comments, result.Permits[i].PermitStatus, refs, locs, result.Permits[i].IsDraft);

                        //if (permit.PermitTypeId != null) permit.setPermitType(self.permitTypes());
                        //if (permit.UtilityOwnerId != null) permit.setUtilityOwner(self.utilityOwners());

                        pers.push(permit);
                    }
                    self.permits(pers);
                } else {
                    $(result.Permits).each(function (index, item) {
                        var refs = [];
                        var locs = [];
                        var projTypes = [];

                        $(item.References).each(function (ind, ref) {
                            var r = new Reference(setKoType(self.referenceTypes(), "ReferenceTypeId", "", ref.ReferenceTypeId), ref.ReferenceValue);
                            refs.push(r);
                        });

                        if (item.ProjectTypes != undefined) {
                            var pts = decimal2Array(item.ProjectTypes, self.projectTypes().length);
                            $(pts).each(function (ind, projType) {
                                projTypes.push(setKoType(self.projectTypes(), "ProjectTypeId", projType));
                            });
                        }


                        $(item.Locations).each(function (ind, loc) {
                            var locType = "";

                            if (loc.OnStreetCode != null && loc.FromStreetCode == null && loc.ToStreetCode == null)
                                locType = "address";
                            else if (loc.OnStreetCode != null && loc.FromStreetCode != null && loc.ToStreetCode == null) {
                                locType = "intersection";
                            } else if (loc.OnStreetCode != null && loc.FromStreetCode != null && loc.ToStreetCode != null) {
                                locType = "street segment";
                            }

                            locs.push(new PostedLocation(loc.SequenceNumber, setKoType(self.occupancyTypes(), "OccupancyTypeID", loc.OccupancyTypeId), locType, loc.OnStreetName, loc.OnStreetCode, loc.FromStreetName, loc.FromStreetCode, loc.FromStreetNode, loc.ToStreetName, loc.ToStreetCode, loc.ToStreetNode, false));
                        });

                        var p = new Permit(token, item.PermitNumber, item.CompnayId, item.CompanyName, setKoType(self.utilityOwners(), "OwnerId", item.UtilityOwnerId), setKoType(self.permitTypes(), "PermitTypeId", item.PermitTypeId), pts, item.EncroachmentTypes, item.EffectiveDate, item.ExpirationDate, item.Purpose, item.Comments, item.PermitStatus, refs, locs, item.IsDraft);

                        pers.push(p);
                    });
                    self.permits(pers);
                }

                self.isPermitLoading(false);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                self.isPermitLoading(false);

                console.log("getPermitsForCompany", thrownError);
            }
        });

        //$loadingIndicator.hide();
        //$("#loading-table").hide();
    };


    self.downloadPermitPdf = function (permit) {
        window.open(self.apiUrl + "api/Permits/GetPermitPdf.pdf?token=" + getUrlParameter("token") + "&permitId=" + permit.PermitNumber(), "Download Permit " + permit.PermitNumber());
    };

    self.requestPermitCancellation = function (permit, event) {
        var answer = confirm("Are you sure you want to request that Permit " + permit.PermitNumber() + " be canceled?");
        if (answer) {
            permit.PermitStatus("Pending Cancellation");
            //self.editPermitTransaction.notifySubscribers(null, "commit");

            var $status = $(event.target).parent().prev(".ClosureStatus");
            var bcCss = $status.css("background-color");
            $status.css("backgroundColor", "#00FA9A");
            $status.animate({ "backgroundColor": bcCss }, 300);

            $(event.target).parent().find(".edit-button").remove();
            $(event.target).parent().find(".cancel-button").remove();

            self.submitPermitCancellation(permit, false, true);
        }
    };

    self.sortPermits = function (data) {
        self.sortDir = self.sortDir === "asc" ? "desc" : "asc";
        self.sort = data;
        self.getPermitsForCompany();
    };

    // new permit application actions
    self.cancelPermitApplication = function () {

        var answer = confirm(notification.cancelNewPermitConfirm);
        if (answer) {
            self.cancelEditPermit();



            //$.notify(notification.cancelNewPermitSuccess, { className: "info", globalPosition: "top left" });
            self.showMainSections();
            self.resetNewPermitFields();
            self.editingPermitItem(null);


        }
    };

    self.submitPermitCancellation = function (scrollTop, isCancelConfirmed, permit) {

        if (isCancelConfirmed === false)
            isCancelConfirmed = confirm(notification.cancelNewPermitConfirm);

        if (isCancelConfirmed) {
            $.ajax({
                type: "POST",
                url: self.apiUrl + "api/Permits/CancelPermit?token=" + getUrlParameter("token") + "&permitNumber=" + permit.PermitNumber(),
                success: function (data) {
                    self.getStatusCodes();
                    self.showMainSections(scrollTop);
                    $.notify(notification.cancelNewPermitSuccess, { className: "success", globalPosition: "top left" });
                    self.resetNewPermitFields();
                    self.editingPermitItem(null);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.log("submitPermitCancellation error: ", xhr, ajaxOptions, thrownError);
                }
            });
        }
    };

    self.submitPermitApplication = function () {


        // ToDo: submit permit application
        self.postPermit(false);
    };

    self.submitPermitDraftApplication = function () {
        self.postPermit(true);
    };

    self.postPermit = function (isDraft) {
        self.applyLocation();
        self.applyReference();
        //self.applyPermit();
        //self.editingPermitItem.setLongDateTimes();

        //var sdt = new Date(self.editingPermitItem().StartDate() + " " + self.editingPermitItem().StartTime());
        //console.log(sdt);
        //var edt = new Date(self.editingPermitItem().EndDate() + " " + self.editingPermitItem().EndTime());
        //console.log(edt);
        //self.editingPermitItem.EffectiveDateTime(sdt);
        //self.editingPermitItem.ExpirationDateTime(edt);

        var errors = ko.validation.group([self.editingPermitItem], { deep: true });

        errors.showAllMessages();
        //console.log(errors());

        //if (!ko.validation.validateObservable(self.editingPermitItem().StartDate().editValue))
        //    $("#formStartDate").focus();

        //else if (!ko.validation.validateObservable(self.editingPermitItem().StartTime().editValue))
        //    $("#formStartTime").focus();

        //else if (!ko.validation.validateObservable(self.editingPermitItem().EndDate().editValue))
        //    $("#formEndDate").focus();

        //else if (!ko.validation.validateObservable(self.editingPermitItem().EndTime().editValue))
        //    $("#formEndTime").focus();

        //else if (!ko.validation.validateObservable(self.editingPermitItem().Purpose().editValue))
        //    $("#formPurpose").focus();

        //else if (!ko.validation.validateObservable(self.editingPermitItem().UtilityOwnerId().editValue))
        //    $("#formUtilityOwners").focus();

        //else if (!ko.validation.validateObservable(self.editingPermitItem().ProjectTypes().editValue))
        //    $("#formProjectTypes").focus();

        //else if (!ko.validation.validateObservable(self.editingPermitItem().Locations().editValue))
        //    $("#formLocations").focus();




        //var hasLocationErrors = false;
        //for (var k = 0; k < self.editingPermitItem().Locations().length; k++) {
        //    var locErr = ko.validation.group([self.editingPermitItem().Locations()[k]], { deep: true, observable: true, live: true });
        //    //console.log(locErr());
        //    if (locErr().length > 0) hasLocationErrors = true;
        //    if (locErr().length > 0) hasLocationErrors = true;
        //}

        //, self.editingPermitItem.UtilityOwnerId, self.editingPermitItem.EffectiveDateTime, self.editingPermitItem.ExpirationDateTime, self.editingPermitItem.Purpose, self.editingPermitItem.PermitTypes, self.editingPermitItem.ProjectTypes, self.editingPermitItem.Locations, self.editingPermitItem.StartDate, self.editingPermitItem.StartTime, self.editingPermitItem.EndDate, self.editingPermitItem.EndTime]



        if (errors().length > 0 /*|| hasLocationErrors*/) return false;

        var refs = [];
        for (var i = 0; i < self.editingPermitItem().References().length; i++) {
            refs.push(new PermitReference(self.editingPermitItem().References()[i].ReferenceTypeId().ReferenceTypeId(), self.editingPermitItem().References()[i].ReferenceValue()));
        }

        var locs = [];
        for (var j = 0; j < self.editingPermitItem().Locations().length; j++) {
            //console.log(self.editingPermitItem().Locations()[j]());
            var loc = new PermitLocation( //sequenceNumber, occupancyTypeId, locationType, onStreetName, fromStreetName, fromStreetCode, fromStreetNode, toStreetName, toStreetCode, toStreetNode
                j + 1,
                self.editingPermitItem().Locations()[j].OccupancyTypeId().OccupancyTypeID,
                self.editingPermitItem().Locations()[j].LocationType(),
                self.editingPermitItem().Locations()[j].OnStreetName(),
                null,
                null,
                null,
                null,
                null,
                null
                );
            //console.log(self.editingPermitItem().Locations()[j].FromStreetName());
            if (self.editingPermitItem().Locations()[j].LocationType().toLowerCase() === "intersection" || self.editingPermitItem().Locations()[j].LocationType().toLowerCase() === "street segment") {
                loc.FromStreetName = self.editingPermitItem().Locations()[j].FromStreetName().StreetName;
                loc.FromStreetCode = self.editingPermitItem().Locations()[j].FromStreetName().StreetCode;
                loc.FromStreetNode = self.editingPermitItem().Locations()[j].FromStreetName().NodeOrder;

                if (self.editingPermitItem().Locations()[j].LocationType().toLowerCase() === "street segment") {
                    loc.ToStreetName = self.editingPermitItem().Locations()[j].ToStreetName().StreetName;
                    loc.ToStreetCode = self.editingPermitItem().Locations()[j].ToStreetName().StreetCode;
                    loc.ToStreetNode = self.editingPermitItem().Locations()[j].ToStreetName().NodeOrder;
                }
            }

            locs.push(loc);
        }



        //var effectiveTime = self.editingPermitItem().StartTime().match(/^([1-9]|0[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)?$/i);
        //var effectiveDateTime = new Date(self.editingPermitItem().StartDate());
        //var effTimeHours = effectiveTime[3].toLowerCase() === "pm" ? (parseInt(effectiveTime[1]) + 12) : effectiveTime[1];
        //var effTimeMinutes = parseInt(effectiveTime[2]);
        //effectiveDateTime.setHours(effTimeHours);
        //effectiveDateTime.setMinutes(effTimeMinutes);

        //var expirationTime = self.editingPermitItem().EndTime().match(/^([1-9]|0[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)?$/i);
        //var expirationDateTime = new Date(self.editingPermitItem().EndDate());
        //var expTimeHours = expirationTime[3].toLowerCase() === "pm" ? (parseInt(expirationTime[1]) + 12) : expirationTime[1];
        //var expTimeMinutes = parseInt(expirationTime[2]);
        //expirationDateTime.setHours(expTimeHours);
        //expirationDateTime.setMinutes(expTimeMinutes);

        //console.log(self.editingPermitItem().UtilityOwnerId().OwnerId);

        var permit = {
            Token: getUrlParameter("token"),
            CompanyId: self.selectedCompany().CompanyId(),
            UtilityOwnerId: self.editingPermitItem().UtilityOwnerId() != undefined ? self.editingPermitItem().UtilityOwnerId().OwnerId : null,
            PermitTypeId: self.editingPermitItem().PermitTypeId().PermitTypeId,
            ProjectTypes: array2Decimal(self.editingPermitItem().ProjectTypes(), self.projectTypes().length),
            EncroachmentTypes: self.editingPermitItem().EncroachmentTypes(),
            EffectiveDate: self.editingPermitItem().EffectiveDateTime(), //effectiveDateTime,
            ExpirationDate: self.editingPermitItem().ExpirationDateTime(), //new Date(self.editingPermitItem().EndDate() + " " + self.editingPermitItem().EndTime()),//expirationDateTime,
            Purpose: self.editingPermitItem().Purpose(),
            Comments: self.editingPermitItem().Comments(),
            IsDraft: isDraft,
            References: refs,
            Locations: locs
        };

        //console.log(ko.toJSON(permit));

        if (self.isPermitNew() === false)
            permit.PermitNumber = self.editingPermitItem().PermitNumber();


        var action = self.isPermitNew() === true ? "api/permits/CreatePermit" : "api/Permits/UpdatePermit?permitNumber=" + permit.PermitNumber;

        $.ajax({
            url: self.apiUrl + action,
            data: JSON.stringify(permit),
            type: 'POST',
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function () {
                $.notify(notification.submitNewAppSuccess, { className: "success", globalPosition: "top left" });
                self.showMainSections();
                self.resetNewPermitFields();
                self.editingPermitItem(null);
            },
            error: function () {
                $.notify(notification.recordNotSaved, { className: "error", globalPosition: "top left" });
            }
        });
    };

    self.resetNewPermitFields = function () {
        //self.selectedUtilityOwner(null);
        //self.selectedPermitType(null);
        //self.selectedProjectTypes.projectTypes([]);
        //self.selectedEncroachmentTypes([]);
        //self.effectiveDate(null);
        //self.expirationDate(null);
        //self.purpose(null);
        //self.comments(null);
        //self.locations([]);
        //self.references([]);

        //self.selectedUtilityOwner.clearError();
        //self.selectedPermitType.clearError();
        //self.selectedProjectTypes.projectTypes.clearError();
        //self.selectedEncroachmentTypes.clearError();
        //self.effectiveDate.clearError();
        //self.expirationDate.clearError();
        //self.purpose.clearError();
        //self.locations.clearError();
        //self.references.clearError();
    };

    //** references
    self.addReference = function (reference) {
        if (reference.ReferenceTypeId == undefined)
            reference = new Reference();

        self.editingPermitItem().References.push(reference);

        //  begin editing the new item straight away
        self.editReference(reference);
    };

    self.removeReference = function (reference) {
        if (self.editingReferenceItem() == null) {
            var answer = confirm("Are you sure you want to delete this reference?");
            if (answer) {
                self.editingPermitItem().References.remove(reference);
            }
        }
    };

    self.editReference = function (reference) {
        if (self.editingReferenceItem() == null) {
            // start the transaction
            reference.beginEdit(self.editReferenceTransaction);

            // shows the edit fields
            self.editingReferenceItem(reference);
        }
    };

    self.applyReference = function () {
        //  commit the edit transaction
        self.editReferenceTransaction.notifySubscribers(null, "commit");

        //  hides the edit fields
        self.editingReferenceItem(null);
    };

    self.cancelEditReference = function () {
        //  reject the edit transaction
        self.editReferenceTransaction.notifySubscribers(null, "rollback");

        //  hides the edit fields
        self.editingReferenceItem(null);
    };

    //** login
    self.requestLogin = function () {
        if (!ko.validation.validateObservable(self.usersEmailAddress))
            return false;

        var $Loading = $("#Loading");
        var $RequestLoginBtn = $("#RequestLoginBtn");
        $RequestLoginBtn.after($Loading);
        $Loading.show();
        $RequestLoginBtn.text("sending request...");
        $RequestLoginBtn.prop('disabled', true);
        $("#LoginMain").html(notification.checkLoginEmail);
        $Loading.hide();
        $.ajax({
            type: "POST",
            url: self.apiUrl + "api/authentication/authenticate?emailAddress=" + self.usersEmailAddress(),
            success: function () {
                $("#LoginMain").html(notification.checkLoginEmail);
                $Loading.hide();
            },
            error: function () { //}xhr, ajaxOptions, thrownError) {
                $RequestLoginBtn.notify(notification.errorSendingSecToken,
                    { elementPosition: "right", className: "error" }
                );
                $Loading.hide();
                $RequestLoginBtn.prop('disabled', false);
                $RequestLoginBtn.val("request login email");
            }
        });
        return true;
    };

    //** documents
    self.addDocument = function () {
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
        }).done(function () {
            $.notify("Document uploaded.", { globalPosition: "top left", className: "success" });
        }).fail(function () {
            $.notify("An error occurred, the files couldn't be sent!", { globalPosition: "top left", className: "error" });
        });

        $("#UploadDocumentProgress").hide();
    };

    //** status codes
    self.getStatusCodes = function () {
        //console.log(ko.toJSON(self.selectedCompany));

        if (self.selectedCompany().CompanyId() == undefined)
            return;


        $.ajax({
            type: "GET",
            url: self.apiUrl + "api/permits/GetStatusSummaryByCompanyId?token=" + getUrlParameter("token") + "&companyId=" + self.selectedCompany().CompanyId(),
            success: function (data) {
                self.permitStatusCodes([]);
                $(data).each(function (index, item) {
                    var s = new PermitStatus(item.StatusCodeId, item.StatusCodeName, item.TotalPermits);
                    self.permitStatusCodes.push(s);
                });

                self.deactivateAllTabs();
                $("#tabs").responsiveTabs("activate", 0);

            }
            //error: function (xhr, ajaxOptions, thrownError) {
            //    //ToDo: handle error
            //}
        });
    };

    self.deactivateAllTabs = function () {
        for (var i = 0; i < 7; i++) {
            $("#tabs").responsiveTabs("deactivate", i);
        }
    };

    self.selectStatusCode = function (data, event) {
        //console.log(event.target);
        //$(".status-button").css("border", "none");
        //if (!$(event.target).hasClass("status-button")) {
        //    $(event.target).parent(".status-button").css("border", "black solid 3px");
        //} else {
        //    //console.log("else");
        //    $(event.target).css("border", "black solid 3px");
        //}
        //$("#PermitsTable").html($("#tab-" + data));
        if (document.getElementById("tab-" + data) !== null) {

            var $tab = document.getElementById("tab-" + data);

            if (screen.width > 768) {
                $("#a-" + data).parent().removeClass('r-tabs-state-default').addClass('r-tabs-state-active');

                $tab.appendChild(document.getElementById("PermitsTable"));
            } else {
                $('.r-tabs-state-active').removeClass('r-tabs-state-active');
                $("#tab-" + data).prev("div").removeClass('r-tabs-state-default').addClass('r-tabs-state-active');

                $tab.previousElementSibling.appendChild(document.getElementById("PermitsTable"));

                $(".r-tabs-panel").css("display", "none");

                /*.r-tabs-panel {
       display: none  !important;
   }*/
            }


            //$tab.previousElementSibling.className.replace("r-tabs-state-default", "r-tabs-state-active");
            //console.log($("#tab-" + data).prev("div.r-tabs-accordion-title.r-tabs-state-default").html());

            // $('.r-tabs-state-active').removeClass('r-tabs-state-active');//.addClass('r-tabs-state-default');
            //



            //$("#PermitsTable").after($("#tab-" + data));

            self.selectedStatusCode(data);
            //$("#loading-table").show();
            self.getPermitsForCompany();

            //console.log(self.permits().length);

        }
    };

    //** nav
    self.showNewPermitSection = function () {
        //var errors = ko.validation.group([self.selectedUtilityOwner, self.effectiveDate, self.expirationDate, self.purpose, self.selectedPermitType, self.selectedProjectTypes.projectTypes, self.locations, self.expirationTime, self.effectiveTime]);
        //errors.showAllMessages();

        $("#LoginSection").hide();
        $("#AccountSection").hide();
        $("#YourPermitsSection").hide();
        $("#UsersCompaniesSection").hide();

        $("#AddNewPermitSection").show();
        var $mapDiv = $("#mapDiv");
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        try {
            map.setOptions({ width: $mapDiv.width() });
        } catch (e) {

        }
    };

    self.cancelNewPermit = function () {
        $("#AddNewPermitSection").hide();

        $("#LoginSection").hide();
        $("#LoginSection").show();
        $("#AccountSection").show();
        $("#YourPermitsSection").show();

        document.body.scrollTop = document.documentElement.scrollTop = 0;


    };

    self.showMainSections = function (scrollTop) {
        self.cancelEditLocation();
        self.cancelEditReference();

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

        if (scrollTop !== false)
            document.body.scrollTop = document.documentElement.scrollTop = 0;

        //if (map == null)
        //    loadMap();
    };

    self.showUsersCompaniesSection = function () {
        $("#YourPermitsSection").hide();
        $("#LoginSection").hide();
        $("#UserDetailsSection").hide();
        $("#AccountSection").hide();

        $("#UsersCompaniesSection").show();

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    };

    //** view model data
    self.getViewModelData = function () {
        $.ajax({
            url: self.apiUrl + "api/permits/GetStreetClosureViewModelData?token=" + getUrlParameter("token"),
            contentType: "application/json; charset=utf-8",
            success: function (data) {
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
                    $(data.UsersCompanyViewModel).each(function (index, item) {
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
                //console.log(data.ProjectTypes);
                self.projectTypes(data.ProjectTypes);

                //self.getReferenceTypes();
                $(data.ReferenceTypes).each(function (index, item) {
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

    self.selectedProjectTypes =
    {
        projectTypes: ko.observableArray().extend({ required: true }),
        sort: function () {
            this.projectTypes(this.projectTypes.sort(function (a, b) { return a - b; }));
        },
        toBinary: function () {
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
        binary2Decimal: function () {
            return parseInt(this.toBinary(), 2);
        },
        decimal2Binary: function (dec) {
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
$(document).ready(function () {
    var getUrl = window.location;
    var host = getUrl.host.toLowerCase();
    if (window.location.protocol == "http:" && host.indexOf("localhost") === -1) {
        var restOfUrl = window.location.href.substr(5);
        window.location = "https:" + restOfUrl;
    }


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

        $("#page-selection").bootpag({
            total: 1,
            page: 1,
            maxVisible: 5
        }).on("page", function (event, num) {
            model.currentPermitPage = num;
            try {
                $("#loading-table").show();
                model.getPermitsForCompany(true);
            } catch (e) {
                //console.log("paging error: " + e);
            }
        });

        //model.addLocation();

        //var location = new Location();
        //model.selectedLocation(location);
        //model.editLocation(location);

    } else {
        var expiredToken = getUrlParameter("ExpiredToken");
        //console.log(expiredToken);
        if (expiredToken == "true") {
            $.notify("Please request a new login email.", { globalPosition: "top left", className: "info" });
        }
        $("#LoginSection").show();
        $("#PageLoadingProgress").hide();
    }
    ko.validation.init({
        decorateElement: false,
        messagesOnModified: true
        //,grouping: { deep: true }
    });

    $(".resize tr th").resizable({
        handles: "e"
    });

    //$(document).ajaxStart(function() {
    //    $(".mask").addClass("ajax");
    //});
    //$(document).ajaxComplete(function() {
    //    $(".mask").removeClass("ajax");
    //});

    $('#tabs').responsiveTabs({
        active: 0,
        //accordionTabElement: "<div data-bind='click: $root.selectStatusCode($data)'></div>",
        //scrollToAccordion: false
        //startCollapsed: 'accordion'
        startCollapsed: false,
        collapsible: false
    });

    $("#a1").click(function () {
        model.selectStatusCode(1);
    });
    $("#a2").click(function () {
        model.selectStatusCode(2);
    });
    $("#a3").click(function () {
        model.selectStatusCode(3);
    });
    $("#a4").click(function () {
        model.selectStatusCode(4);
    });
    $("#a5").click(function () {
        model.selectStatusCode(5);
    });
    $("#a6").click(function () {
        model.selectStatusCode(6);
    });
    $("#a7").click(function () {
        model.selectStatusCode(7);
    });
    $("#a8").click(function () {
        model.selectStatusCode(8);
    });
    $("#a9").click(function () {
        model.selectStatusCode(9);
    });


    // ToDo:...
    $(document).ajaxError(function (event, request, settings) {
        if (request.status === 401) {
            window.location.href = "/?ExpiredToken=true";
        }
    });


});


getUrlParameter = function (sParam) {
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

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + (days - 1));
    return date;
};

// day is a date
Date.prototype.dayDiff = function (day) {
    var date = new Date(this.valueOf());
    return Math.round((day - date) / (1000 * 60 * 60 * 24)) + 1;
};

ko.validation.rules["validPermitDate"] = {
    validator: function (selectedDate, params) {

        if (!Date.parse(selectedDate))
            return false;

        selectedDate = new Date(selectedDate);
        var today = new Date();

        return selectedDate >= today.addDays(params[0]).setHours(0, 0, 0, 0);
    },
    message: "Must be on or after {1}"
};
ko.validation.registerExtenders();



function replaceButtonText(buttonId, text) {
    if (document.getElementById) {
        var button = document.getElementById(buttonId);
        if (button) {
            if (button.childNodes[0]) {
                button.childNodes[0].nodeValue = text;
            }
            else if (button.value) {
                button.value = text;
            }
            else //if (button.innerHTML)
            {
                button.innerHTML = text;
            }
        }
    }
}