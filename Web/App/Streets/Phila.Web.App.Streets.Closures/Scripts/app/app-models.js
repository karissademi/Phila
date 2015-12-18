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

//function Location(onStreetName, onStreetCode, onStreetSegmentId, fromStreetName, fromStreetCode, fromStreetSegmentId, fromStreetNodeId, atStreetName, atStreetCode, atStreetSegmentId, toStreetName, toStreetCode, toStreetSegmentId, toStreetNodeId, occupancyType, referenceType, referenceValue, highTrafficArea, locationType, sequenceNumber) {
//    var self = this;

//    //if (onStreetName == undefined) onStreetName = { st_name: "" };
//    if (locationType == undefined) locationType = "blank";
//    if (fromStreetName == undefined) fromStreetName = { StreetName: "blank" };
//    if (toStreetName == undefined) toStreetName = { StreetName: "blank" };

//    self.OccupancyType = ko.observable(occupancyType).extend({ editable: true }).extend({ required: true });;
//    self.ReferenceType = ko.observable(referenceType).extend({ editable: true });
//    self.ReferenceValue = ko.observable(referenceValue).extend({ editable: true });
//    self.HighTrafficArea = ko.observable(highTrafficArea).extend({ editable: true });
//    self.LocationType = ko.observable(locationType).extend({ editable: true });
//    self.SequenceNumber = ko.observable(sequenceNumber).extend({ editable: true });

//    self.OnStreet = ko.observable(onStreetName).extend({ editable: true }).extend({ required: true });
//    self.OnStreetCode = ko.observable(onStreetCode).extend({ editable: true });
//    self.OnStreetNodeId = ko.observable(onStreetSegmentId).extend({ editable: true });

//    self.FromStreet = ko.observable(fromStreetName).extend({ editable: true }).extend({
//        validation: {
//            validator: function (val, params) {
//                console.log("from street validation: ", val, self.LocationType());
                
//                if (self.LocationType() == "Intersection" || self.LocationType() == "Street Segment" && (val == undefined || val.StreetName == "blank")) {
//                    return false;
//                }

//                return true;
//            },
//            message: "Required",
//        }
//    });

//    self.FromStreetCode = ko.observable(fromStreetCode).extend({ editable: true });
//    self.FromStreetNodeId = ko.observable(fromStreetNodeId).extend({ editable: true });

//    //self.AtStreet = ko.observable(atStreetName).extend({ editable: true });
//    //self.AtStreetCode = ko.observable(atStreetCode).extend({ editable: true });
//    //self.AtStreetSegmentId = ko.observable(atStreetSegmentId).extend({ editable: true });

//    self.ToStreet = ko.observable(toStreetName).extend({ editable: true }).extend({
//        validation: {
//            validator: function (val, params) {
//                console.log("to street validation: ", val, self.LocationType());
//                if (self.LocationType() === "Street Segment" && (val == undefined || val.StreetName == "blank")) {
//                    return false;
//                }

//                return true;
//            },
//            message: "Required",
//        }
//    });

//    self.ToStreetCode = ko.observable(toStreetCode).extend({ editable: true });
//    self.ToStreetNodeId = ko.observable(toStreetNodeId).extend({ editable: true });
//}

//Location.prototype.beginEdit = function (transaction) {
//    this.OnStreet.beginEdit(transaction);
//    this.OnStreetCode.beginEdit(transaction);
//    this.OnStreetNodeId.beginEdit(transaction);
//    this.FromStreet.beginEdit(transaction);
//    this.FromStreetCode.beginEdit(transaction);
//    this.FromStreetNodeId.beginEdit(transaction);
//    //this.AtStreet.beginEdit(transaction);
//    //this.AtStreetCode.beginEdit(transaction);
//    //this.AtStreetSegmentId.beginEdit(transaction);
//    this.ToStreet.beginEdit(transaction);
//    this.ToStreetCode.beginEdit(transaction);
//    this.ToStreetNodeId.beginEdit(transaction);
//    this.OccupancyType.beginEdit(transaction);
//    this.ReferenceType.beginEdit(transaction);
//    this.ReferenceValue.beginEdit(transaction);
//    this.HighTrafficArea.beginEdit(transaction);
//    this.LocationType.beginEdit(transaction);
//};

function PostedLocation(sequenceNumber, occumpanyTypeId, locationType, onStreetName, onStreetCode, fromStreetName, fromStreetCode, fromStreetNode, toStreetName, toStreetCode, toStreetNode) {
    var self = this;

    self.SequenceNumber = ko.observable(sequenceNumber).extend({ editable: true });
    self.OccupancyTypeId = ko.observable(occumpanyTypeId).extend({ editable: true }).extend({ required: true });
    self.LocationType = ko.observable(locationType).extend({ editable: true }).extend({ required: true });;
    self.OnStreetName = ko.observable(onStreetName).extend({ editable: true }).extend({ required: true });;
    self.OnStreetCode = ko.observable(onStreetCode).extend({ editable: true });
    self.FromStreetName = ko.observable(fromStreetName).extend({ editable: true }).extend({
                validation: {
                    validator: function (val, params) {               
                        if (self.LocationType() == "Intersection" || self.LocationType() == "Street Segment" && (val == undefined || val.StreetName == "blank")) {
                            return false;
                        }

                        return true;
                    },
                    message: "Required",
                }
            });
    self.FromStreetCode = ko.observable(fromStreetCode).extend({ editable: true });
    self.FromStreetNode = ko.observable(fromStreetNode).extend({ editable: true });
    self.ToStreetName = ko.observable(toStreetName).extend({ editable: true }).extend({
                validation: {
                    validator: function (val, params) {
                        if (self.LocationType() === "Street Segment" && (val == undefined || val.StreetName == "blank")) {
                            return false;
                        }

                        return true;
                    },
                    message: "Required",
                }
            });
    self.ToStreetCode = ko.observable(toStreetCode).extend({ editable: true });
    self.ToStreetNode = ko.observable(toStreetNode).extend({ editable: true });
}

PostedLocation.prototype.beginEdit = function(transaction) {
    this.SequenceNumber.beginEdit(transaction);
    this.OccupancyTypeId.beginEdit(transaction);
    this.LocationType.beginEdit(transaction);
    this.OnStreetName.beginEdit(transaction);
    this.OnStreetCode.beginEdit(transaction);
    this.FromStreetName.beginEdit(transaction);
    this.FromStreetCode.beginEdit(transaction);
    this.FromStreetNode.beginEdit(transaction);
    this.ToStreetName.beginEdit(transaction);
    this.ToStreetCode.beginEdit(transaction);
    this.ToStreetNode.beginEdit(transaction);
}


function Permit(token, permitNumber, companyId, companyName, utilityOwnerId, permitTypeId, projectTypes, encroachmentTypes, effectiveDateTime, expirationDateTime, purpose, comments, permitStatus, references, locations, isDraft) {
    var self = this;

    self.Token = ko.observable(token).extend({ editable: true });
    self.PermitNumber = ko.observable(permitNumber).extend({ editable: true });
    self.CompanyId = ko.observable(companyId).extend({ editable: true }).extend({ required: true });
    self.CompanyName = ko.observable(companyName).extend({ editable: true });
    self.PermitTypeId = ko.observable(permitTypeId).extend({ editable: true }).extend({ required: true });
    self.UtilityOwnerId = ko.observable(utilityOwnerId).extend({ editable: true }).extend({
        required: {
            onlyIf: function () {
                if (self.PermitTypeId() != undefined && self.PermitTypeId().PermitTypeId > 10) {
                    return true;
                }
                return false;
            }
        }
    });
    self.ProjectTypes = ko.observable(projectTypes).extend({ editable: true }).extend({ required: true });
    self.EncroachmentTypes = ko.observableArray(encroachmentTypes).extend({ editable: true }).extend({
        required: {
            onlyIf: function () {
                if (self.PermitTypeId() != undefined && (self.PermitTypeId().PermitTypeId < 4 || self.PermitTypeId().PermitTypeId == 9)) {
                    return true;
                }
                return false;
            }
        }
    });
    self.EffectiveDateTime = ko.observable(effectiveDateTime).extend({ editable: true });
    self.ExpirationDateTime = ko.observable(expirationDateTime).extend({ editable: true });
    self.Purpose = ko.observable(purpose).extend({ editable: true }).extend({ required: true });
    self.Comments = ko.observable(comments).extend({ editable: true });
    self.IsDraft = ko.observable(isDraft).extend({ editable: true });
    self.PermitStatus = ko.observable(permitStatus).extend({ editable: true });
    self.References = ko.observableArray(references).extend({ editable: true });
    self.Locations = ko.observableArray(locations).extend({ editable: true }).extend({ required: true });

    self.StartDate = ko.observable(self.EffectiveDateTime() != undefined && self.EffectiveDateTime() != "" ? self.EffectiveDateTime().substr(0, 10) : "").extend({ editable: true }).extend({ validPermitDate: [10, (new Date().addDays(11).getMonth() + 1) + "/" + new Date().addDays(11).getDate() + "/" + new Date().addDays(11).getFullYear()] });

    self.StartTime = ko.observable(self.EffectiveDateTime() != undefined && self.EffectiveDateTime() != "" ? getShortTime(self.EffectiveDateTime()) : "").extend({ editable: true }).extend({
        validation: {
            validator: function (val, params) {

                if (val == undefined) return false;

                var validTime = val.match(/^([0-9]|0[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)?$/i);
                if (validTime == null || validTime.length !== 4) return false;

                return true;
            },
            message: "A valid time required"
        }
    });

    self.EndDate = ko.observable(self.ExpirationDateTime() != undefined && self.ExpirationDateTime() != "" ? self.ExpirationDateTime().substr(0, 10) : "").extend({ editable: true }).extend({
        validation: {
            validator: function (val, params) {
                if (Date.parse(val) && Date.parse(self.StartDate())) {
                    return Date.parse(val) >= Date.parse(self.StartDate());
                }
                return false;
            },
            message: "Must be on or after the effective date",
        }
    });

    self.EndTime = ko.observable(self.ExpirationDateTime() != undefined && self.ExpirationDateTime() != "" ? getShortTime(self.ExpirationDateTime()) : "").extend({ editable: true }).extend({
        validation: {
            validator: function (val, params) {

                if (val == undefined) return false;

                self.setLongDateTimes();

                if (self.ExpirationDateTime() > self.EffectiveDateTime()) return true;

                return false;
            },
            message: "Must be after the effective date and time",
        }
    });

    //this.setShortDatesAndTimes();
};

Permit.prototype.beginEdit = function (transaction) {
    this.Token.beginEdit(transaction);
    this.PermitNumber.beginEdit(transaction);
    this.CompanyId.beginEdit(transaction);
    this.CompanyName.beginEdit(transaction);
    this.PermitTypeId.beginEdit(transaction);
    this.EncroachmentTypes.beginEdit(transaction);
    this.EffectiveDateTime.beginEdit(transaction);
    this.ExpirationDateTime.beginEdit(transaction);
    this.Purpose.beginEdit(transaction);
    this.Comments.beginEdit(transaction);
    this.IsDraft.beginEdit(transaction);
    this.PermitStatus.beginEdit(transaction);
    this.References.beginEdit(transaction);
    this.Locations.beginEdit(transaction);
    this.StartDate.beginEdit(transaction);
    this.StartTime.beginEdit(transaction);
    this.EndDate.beginEdit(transaction);
    this.EndTime.beginEdit(transaction);
};

function getShortTime(datetime) {
    //console.log("datetime", datetime);
    var hours, minutes, xm;
    var dt = new Date(datetime);
    //console.log("dt", dt.toUTCString());

    hours = dt.getUTCHours();
    //console.log("hours", hours);
    xm = " AM";
    if (hours > 11) {
        xm = " PM";
        if (hours > 12) {
            hours = hours / 2;
        }
    }
    if (hours === 0)
        hours = 12;

    minutes = dt.getUTCMinutes();
    
    if (minutes < 10) minutes = "0" + minutes;
    //console.log("minutes", minutes);
    var time = hours + ":" + minutes + xm;
    //console.log("time", time);
    return time;
};

//Permit.prototype.setShortDatesAndTimes = function () {

//    if (this.EffectiveDateTime() == null || this.ExpirationDateTime() == null) return;

//    var hours, minutes, xm;

//    // set start date
//    this.StartDate(this.EffectiveDateTime().substr(0, 10));

//    // set start time
//    var efDateTime = new Date(this.EffectiveDateTime());
//    hours = efDateTime.getHours();
//    xm = " AM";
//    if (hours > 12) {
//        hours = hours / 2;
//        xm = " PM";
//    }
//    minutes = efDateTime.getMinutes();
//    if (minutes < 10) minutes = "0" + minutes;
//    var st = hours + ":" + minutes + xm;

//    this.StartTime(st);

//    // set end date
//    this.EndDate(this.ExpirationDateTime().substr(0, 10));

//    // set end time
//    var exDateTime = new Date(this.ExpirationDateTime());
//    hours = exDateTime.getUTCHours();
//    xm = " AM";
//    if (hours > 12) {
//        hours = hours / 2;
//        xm = " PM";
//    }
//    minutes = exDateTime.getMinutes();
//    if (minutes < 10) minutes = "0" + minutes;
//    var et = hours + ":" + minutes + xm;
//    this.EndTime(et);
//};

Permit.prototype.setLongDateTimes = function () {
    try {
        // set effective datetime
        var effectiveTime = this.StartTime().match(/^([0-9]|0[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)?$/i);
        //console.log("effectiveTime", effectiveTime.toUTCString());
        var effectiveDateTime = new Date(this.StartDate());

        var effTimeHours;
        var efHrs = parseInt(effectiveTime[1]);
        if (effectiveTime[3].toLowerCase() === "pm" && effectiveTime[1] != 12) {
            effTimeHours = efHrs + 12;
        }else if (effectiveTime[3].toLowerCase() === "am" && efHrs == 12) {
            effTimeHours = 0;
        }
        else {
            effTimeHours = efHrs;
        }

        var effTimeMinutes = parseInt(effectiveTime[2]);
        effectiveDateTime.setHours(effTimeHours);
        effectiveDateTime.setMinutes(effTimeMinutes);
        this.EffectiveDateTime(effectiveDateTime);
        console.log("effectiveDateTime", effectiveDateTime.toUTCString());

        // set expiration datetime
        var expirationTime = this.EndTime().match(/^([0-9]|0[1-9]|1[0-2]):([0-5]\d)\s?(AM|PM)?$/i);
        //console.log("expirationTime", expirationTime.toUTCString());
        var expirationDateTime = new Date(this.EndDate());

        var expTimeHours;
        var exHrs = parseInt(expirationTime[1]);
        if (expirationTime[3].toLowerCase() === "pm" && expirationTime[1] != 12) {
            expTimeHours = exHrs + 12;
        } else if (expirationTime[3].toLowerCase() === "am" && efHrs == 12) {
            expTimeHours = 0;
        }
        else {
            expTimeHours = exHrs;
        }

        var expTimeMinutes = parseInt(expirationTime[2]);
        expirationDateTime.setHours(expTimeHours);
        expirationDateTime.setMinutes(expTimeMinutes);
        this.ExpirationDateTime(expirationDateTime);
        console.log("exDateTime", expirationDateTime.toUTCString());
    } catch (e) {

    }

};

//Permit.prototype.setPermitType = function (permitTypesArray) {
//    var self = this;

//    var result = $.grep(permitTypesArray, function (obj) { return obj["PermitTypeId"] == self.PermitTypeId(); });
//    this.PermitTypeId(result[0]);
//}


//Permit.prototype.setUtilityOwner = function (utilityOwnersArray) {
//    var self = this;
//    var result = $.grep(utilityOwnersArray, function (obj) { return obj["UtilityOwnerId"] == self.UtilityOwnerId(); });
//    this.UtilityOwnerId(result[0]);
//}

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

function setKoType(array, property, id) {
    //console.log(array, property, id);
    
    var result = $.grep(array, function(obj) {
        if (typeof obj[property] === "function") {
            return obj[property]() == id;
        } else {
            return obj[property] == id;
        }
    });
    //console.log(ko.toJSON(result));
    return result[0];
}

function sortProjectTypes() {
    //this.projectTypes(this.projectTypes.sort(function(a, b) { return a - b; }));
}

//** BEGIN required support for the PSD's legacy code
function intArray2Binary(array, totalOptions) {
    /// <summary>
    /// Converts an array to binary
    /// </summary>
    /// <param name="array" type="Array">
    /// An array of project type ids
    /// </param>
    /// <param name="length" type="Array">
    /// Total number of project types
    /// </param>
    /// <returns type="String" />

    var a = [];
    for (var i = 0; i < totalOptions; i++)
        a.push("0");

    for (var j = 0; j < array.length; j++)
        a[parseInt(array[j]) - 1] = "1";

    var b = "";

    for (var k = 0; k < a.length; k++)
        b += a[k];

    return b;


}

function binary2Decimal(bin) {
    return parseInt(bin, 2);
}

function decimal2Binary(dec, totalOptions) {
    var bin = (dec >>> 0).toString(2);
    var len = bin.length;
    var dif = totalOptions - len;
    for (var i = 0; i < dif; i++)
        bin = "0" + bin;

    return bin;
}

function binary2Array(bin) {
    
    var pts = bin.match(/[1]|[0]/g);
    var projectTypes = [];
    for (var i = 0; i < pts.length; i++) {
        if (pts[i] == "1") {
            projectTypes.push(i + 1);
        }
    }
    return projectTypes;
}

function decimal2Array(dec, totalProjectTypes) {
    
    var bin = decimal2Binary(dec, totalProjectTypes);
    var result = binary2Array(bin);
    return result;
}

function array2Decimal(array, totalOptions) {
    var bin = intArray2Binary(array, totalOptions);
    return binary2Decimal(bin, totalOptions);
}

// END required support for the PSD's legacy code

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