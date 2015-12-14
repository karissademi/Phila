// Models
function Contact(contactId, contactFirstName, contactLastName, username, contactEmailAddress, contactPhoneNumber) {
    var self = this;

    self.ContactId = ko.observable(contactId).extend({ editable: true });
    self.ContactFirstName = ko.observable(contactFirstName).extend({ editable: true });
    self.ContactLastName = ko.observable(contactLastName).extend({ editable: true });
    self.Username = ko.observable(username).extend({ editable: true });
    self.ContactEmailAddress = ko.observable(contactEmailAddress).extend({ editable: true });
    self.ContactPhoneNumber = ko.observable(contactPhoneNumber).extend({ editable: true });
    self.ContactFullName = ko.pureComputed(function () {
        return self.ContactFirstName() + " " + self.ContactLastName();
    });
}


function PermitLocation(sequenceNumber, occupancyTypeId, locationType, onStreetName,
        fromStreetName, fromStreetCode, fromStreetNode,
        toStreetName, toStreetCode, toStreetNode) {
    var self = this;

    self.SequenceNumber = sequenceNumber;

    self.OccupancyTypeId = occupancyTypeId;
    self.LocationType = locationType;

    self.OnStreetName = onStreetName;

    self.FromStreetName = fromStreetName;
    self.FromStreetCode = fromStreetCode;
    self.FromStreetNode = fromStreetNode;

    self.ToStreetName = toStreetName;
    self.ToStreetCode = toStreetCode;
    self.ToStreetNode = toStreetNode;
}

function PermitReference(referenceTypeId, referenceValue) {
    var self = this;

    self.ReferenceTypeId = referenceTypeId;
    self.ReferenceValue = referenceValue;
}

Contact.prototype.beginEdit = function (transaction) {
    this.ContactId.beginEdit(transaction);
    this.ContactFirstName.beginEdit(transaction);
    this.ContactLastName.beginEdit(transaction);
    this.Username.beginEdit(transaction);
    this.ContactEmailAddress.beginEdit(transaction);
    this.ContactPhoneNumber.beginEdit(transaction);
};

function Company(companyId, companyName, companyPhoneNumber, companyFaxNumber, website, billingStreetAddress1, billingStreetAddress2, billingStreetAddress3, billingCity, billingState, billingZipCode, philadelphiaTaxId) {
    var self = this;

    self.CompanyId = ko.observable(companyId).extend({ editable: true });
    self.CompanyName = ko.observable(companyName).extend({ editable: true });
    self.CompanyPhoneNumber = ko.observable(companyPhoneNumber).extend({ editable: true });
    self.CompanyFaxNumber = ko.observable(companyFaxNumber).extend({ editable: true });
    self.Website = ko.observable(website).extend({ editable: true });
    self.BillingStreetAddress1 = ko.observable(billingStreetAddress1).extend({ editable: true });
    self.BillingStreetAddress2 = ko.observable(billingStreetAddress2).extend({ editable: true });
    self.BillingStreetAddress3 = ko.observable(billingStreetAddress3).extend({ editable: true });
    self.BillingCity = ko.observable(billingCity).extend({ editable: true });
    self.BillingState = ko.observable(billingState).extend({ editable: true });
    self.BillingZipCode = ko.observable(billingZipCode).extend({ editable: true });
    self.PhiladelphiaTaxId = ko.observable(philadelphiaTaxId).extend({ editable: true });
}

Company.prototype.beginEdit = function (transaction) {
    this.CompanyId.beginEdit(transaction);
    this.CompanyName.beginEdit(transaction);
    this.CompanyPhoneNumber.beginEdit(transaction);
    this.CompanyFaxNumber.beginEdit(transaction);
    this.Website.beginEdit(transaction);
    this.BillingStreetAddress1.beginEdit(transaction);
    this.BillingStreetAddress2.beginEdit(transaction);
    this.BillingStreetAddress3.beginEdit(transaction);
    this.BillingCity.beginEdit(transaction);
    this.BillingState.beginEdit(transaction);
    this.BillingZipCode.beginEdit(transaction);
    this.PhiladelphiaTaxId.beginEdit(transaction);
};

function Location(onStreetName, onStreetCode, onStreetSegmentId, fromStreetName, fromStreetCode, fromStreetSegmentId, fromStreetNodeId, atStreetName, atStreetCode, atStreetSegmentId, toStreetName, toStreetCode, toStreetSegmentId, toStreetNodeId, occupancyType, referenceType, referenceValue, highTrafficArea, locationType) {
    var self = this;

    //if (onStreetName == undefined) onStreetName = { st_name: "" };
    if (locationType == undefined) locationType = "blank";
    if (fromStreetName == undefined) fromStreetName = { StreetName: "blank" };
    if (toStreetName == undefined) toStreetName = { StreetName: "blank" };

    self.OccupancyType = ko.observable(occupancyType).extend({ editable: true }).extend({ required: true });;
    self.ReferenceType = ko.observable(referenceType).extend({ editable: true });
    self.ReferenceValue = ko.observable(referenceValue).extend({ editable: true });
    self.HighTrafficArea = ko.observable(highTrafficArea).extend({ editable: true });
    self.LocationType = ko.observable(locationType).extend({ editable: true });

    self.OnStreet = ko.observable(onStreetName).extend({ editable: true }).extend({ required: true });
    self.OnStreetCode = ko.observable(onStreetCode).extend({ editable: true });
    self.OnStreetNodeId = ko.observable(onStreetSegmentId).extend({ editable: true });

    self.FromStreet = ko.observable(fromStreetName).extend({ editable: true }).extend({
        validation: {
            validator: function (val, params) {
                console.log("from street validation: ", val, self.LocationType());
                
                if (self.LocationType() == "Intersection" || self.LocationType() == "Street Segment" && (val == undefined || val.StreetName == "blank")) {
                    return false;
                }

                return true;
            },
            message: "Required",
        }
    });

    self.FromStreetCode = ko.observable(fromStreetCode).extend({ editable: true });
    self.FromStreetNodeId = ko.observable(fromStreetNodeId).extend({ editable: true });

    //self.AtStreet = ko.observable(atStreetName).extend({ editable: true });
    //self.AtStreetCode = ko.observable(atStreetCode).extend({ editable: true });
    //self.AtStreetSegmentId = ko.observable(atStreetSegmentId).extend({ editable: true });

    self.ToStreet = ko.observable(toStreetName).extend({ editable: true }).extend({
        validation: {
            validator: function (val, params) {
                console.log("to street validation: ", val, self.LocationType());
                if (self.LocationType() === "Street Segment" && (val == undefined || val.StreetName == "blank")) {
                    return false;
                }

                return true;
            },
            message: "Required",
        }
    });

    self.ToStreetCode = ko.observable(toStreetCode).extend({ editable: true });
    self.ToStreetNodeId = ko.observable(toStreetNodeId).extend({ editable: true });


}

Location.prototype.beginEdit = function (transaction) {
    this.OnStreet.beginEdit(transaction);
    this.OnStreetCode.beginEdit(transaction);
    this.OnStreetNodeId.beginEdit(transaction);
    this.FromStreet.beginEdit(transaction);
    this.FromStreetCode.beginEdit(transaction);
    this.FromStreetNodeId.beginEdit(transaction);
    //this.AtStreet.beginEdit(transaction);
    //this.AtStreetCode.beginEdit(transaction);
    //this.AtStreetSegmentId.beginEdit(transaction);
    this.ToStreet.beginEdit(transaction);
    this.ToStreetCode.beginEdit(transaction);
    this.ToStreetNodeId.beginEdit(transaction);
    this.OccupancyType.beginEdit(transaction);
    this.ReferenceType.beginEdit(transaction);
    this.ReferenceValue.beginEdit(transaction);
    this.HighTrafficArea.beginEdit(transaction);
    this.LocationType.beginEdit(transaction);
};

function Permit(permitId, purpose, permitLocation, startDate, endDate, permitStatus) {
    var self = this;
     
    self.PermitId = ko.observable(permitId).extend({ editable: true });
    self.Purpose = ko.observable(purpose).extend({ editable: true });
    self.PermitLocation = ko.observable(permitLocation).extend({ editable: true });
    self.StartDate = ko.observable(startDate).extend({ editable: true });
    self.EndDate = ko.observable(endDate).extend({ editable: true });
    self.PermitStatus = ko.observable(permitStatus).extend({ editable: true });
}

Permit.prototype.beginEdit = function (transaction) {
    this.PermitId.beginEdit(transaction);
    this.Purpose.beginEdit(transaction);
    this.PermitLocation.beginEdit(transaction);
    this.StartDate.beginEdit(transaction);
    this.EndDate.beginEdit(transaction);
    this.PermitStatus.beginEdit(transaction);
};

function Reference(referenceTypeId, referenceTypeName, referenceValue) {
    var self = this;

    self.ReferenceTypeId = ko.observable(referenceTypeId).extend({ editable: true });
    self.ReferenceTypeName = ko.observable(referenceTypeName).extend({ editable: true });
    self.ReferenceValue = ko.observable(referenceValue).extend({ editable: true });
};

Reference.prototype.beginEdit = function (transaction) {
    this.ReferenceTypeId.beginEdit(transaction);
    this.ReferenceTypeName.beginEdit(transaction);
    this.ReferenceValue.beginEdit(transaction);
};

function ProjectType(projectTypeId, projectTypeName) {
    var self = this;

    self.ProjectTypeId = ko.observable(projectTypeId).extend({ editable: true });
    self.ProjectTypeName = ko.observable(projectTypeName).extend({ editable: true });
};

function PermitType(permitTypeId, permitTypeName) {
    var self = this;

    self.PermitTypeId = ko.observable(permitTypeId).extend({ editable: true });
    self.PermitTypeName = ko.observable(permitTypeName).extend({ editable: true });
};

function PermitStatus(statusId, statusName, totalPermits) {
    /// <summary>
    ///     Permit status type object
    /// </summary>
    /// <param name="statusId" type="int">
    ///     ID for the status type
    /// </param>
    /// <param name="statusName" type="string">
    ///     Name for try status type
    /// </param>

    var self = this;

    self.StatusId = statusId;
    self.StatusName = statusName;
    self.TotalPermits = totalPermits;
};

function Encroachment(encroachmentTypeId, encroachmentTypeName) {
    var self = this;

    self.EncroachmentTypeId = encroachmentTypeId;
    self.EncroachmentTypeName = encroachmentTypeName;
}