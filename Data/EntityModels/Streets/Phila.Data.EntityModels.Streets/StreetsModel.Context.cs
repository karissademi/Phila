﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Phila.Data.EntityModels.Streets
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    using System.Data.Entity.Core.Objects;
    using System.Linq;
    
    public partial class SCBPPSEntities : DbContext
    {
        public SCBPPSEntities()
            : base("name=SCBPPSEntities")
        {
            this.Configuration.LazyLoadingEnabled = false;
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<tblContact> tblContacts { get; set; }
        public virtual DbSet<tblDecision> tblDecisions { get; set; }
        public virtual DbSet<tblDistrictRegion> tblDistrictRegions { get; set; }
        public virtual DbSet<tblDistrict> tblDistricts { get; set; }
        public virtual DbSet<tblDistrictType> tblDistrictTypes { get; set; }
        public virtual DbSet<tblOwner> tblOwners { get; set; }
        public virtual DbSet<tblPermit_CCs> tblPermit_CCs { get; set; }
        public virtual DbSet<tblPermit_Districts> tblPermit_Districts { get; set; }
        public virtual DbSet<tblPermit_Encroachment> tblPermit_Encroachment { get; set; }
        public virtual DbSet<tblPermit_Locations> tblPermit_Locations { get; set; }
        public virtual DbSet<tblPermit_Reasons> tblPermit_Reasons { get; set; }
        public virtual DbSet<tblPermit_Remarks> tblPermit_Remarks { get; set; }
        public virtual DbSet<tblPermitAudit> tblPermitAudits { get; set; }
        public virtual DbSet<tblPermit> tblPermits { get; set; }
        public virtual DbSet<tblPermitType> tblPermitTypes { get; set; }
        public virtual DbSet<tblProjectType> tblProjectTypes { get; set; }
        public virtual DbSet<tblPermit_Location_GIS> tblPermit_Location_GIS { get; set; }
        public virtual DbSet<tblCompany> tblCompanies { get; set; }
        public virtual DbSet<tblCompanyType> tblCompanyTypes { get; set; }
        public virtual DbSet<tblStatusCode> tblStatusCodes { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<tblOccupancyType> tblOccupancyTypes { get; set; }
        public virtual DbSet<tblEncroachmentType> tblEncroachmentTypes { get; set; }
        public virtual DbSet<tblStreet> tblStreets { get; set; }
        public virtual DbSet<tblNode> tblNodes { get; set; }
        public virtual DbSet<Document> Documents { get; set; }
        public virtual DbSet<UserToken> UserTokens { get; set; }
        public virtual DbSet<tblPermit_References> tblPermit_References { get; set; }
        public virtual DbSet<tblReferenceType> tblReferenceTypes { get; set; }
        public virtual DbSet<STREETCL_NODE> STREETCL_NODE { get; set; }
        public virtual DbSet<tblPermit_Extensions> tblPermit_Extensions { get; set; }
        public virtual DbSet<tblPermit_Fees> tblPermit_Fees { get; set; }
        public virtual DbSet<tblSpecialNode> tblSpecialNodes { get; set; }
        public virtual DbSet<STREETCL_ARC> STREETCL_ARC { get; set; }
    
        public virtual ObjectResult<Get_CrossStreetsAndOnStreetSegIDsFromStCode2_Result> Get_CrossStreetsAndOnStreetSegIDsFromStCode2(Nullable<int> st_Code)
        {
            var st_CodeParameter = st_Code.HasValue ?
                new ObjectParameter("St_Code", st_Code) :
                new ObjectParameter("St_Code", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Get_CrossStreetsAndOnStreetSegIDsFromStCode2_Result>("Get_CrossStreetsAndOnStreetSegIDsFromStCode2", st_CodeParameter);
        }
    
        public virtual ObjectResult<Get_CrossStreetsFromStCode_new_Result> Get_CrossStreetsFromStCode_new(Nullable<int> st_Code)
        {
            var st_CodeParameter = st_Code.HasValue ?
                new ObjectParameter("St_Code", st_Code) :
                new ObjectParameter("St_Code", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Get_CrossStreetsFromStCode_new_Result>("Get_CrossStreetsFromStCode_new", st_CodeParameter);
        }
    
        public virtual ObjectResult<get_OnStreetElementsBetweenOrderedPair_Result> get_OnStreetElementsBetweenOrderedPair(Nullable<int> st_Code, Nullable<int> fromNodeOrder, Nullable<int> toNodeOrder)
        {
            var st_CodeParameter = st_Code.HasValue ?
                new ObjectParameter("St_Code", st_Code) :
                new ObjectParameter("St_Code", typeof(int));
    
            var fromNodeOrderParameter = fromNodeOrder.HasValue ?
                new ObjectParameter("FromNodeOrder", fromNodeOrder) :
                new ObjectParameter("FromNodeOrder", typeof(int));
    
            var toNodeOrderParameter = toNodeOrder.HasValue ?
                new ObjectParameter("ToNodeOrder", toNodeOrder) :
                new ObjectParameter("ToNodeOrder", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<get_OnStreetElementsBetweenOrderedPair_Result>("get_OnStreetElementsBetweenOrderedPair", st_CodeParameter, fromNodeOrderParameter, toNodeOrderParameter);
        }
    
        public virtual ObjectResult<OrderedNodesOnStcode_Result> OrderedNodesOnStcode(Nullable<int> stcode)
        {
            var stcodeParameter = stcode.HasValue ?
                new ObjectParameter("stcode", stcode) :
                new ObjectParameter("stcode", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<OrderedNodesOnStcode_Result>("OrderedNodesOnStcode", stcodeParameter);
        }
    
        public virtual ObjectResult<Sp_AllStreets_Result> Sp_AllStreets()
        {
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction<Sp_AllStreets_Result>("Sp_AllStreets");
        }
    
        public virtual int sp_Get_HightrafficArea(Nullable<int> segID)
        {
            var segIDParameter = segID.HasValue ?
                new ObjectParameter("SegID", segID) :
                new ObjectParameter("SegID", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_Get_HightrafficArea", segIDParameter);
        }
    
        public virtual int sp_SavePermitData(string permit_Number, Nullable<int> permitTypeId, Nullable<System.DateTime> entryDate, Nullable<System.DateTime> applicationDate, Nullable<System.DateTime> effectiveDate, Nullable<System.DateTime> expirationDate, Nullable<int> contactId, string grantedToText, string timeText, Nullable<bool> nightPermit, string purpose, string comments, Nullable<System.DateTime> issueDate, Nullable<int> authorizedSignatureId, Nullable<short> decisionId, Nullable<int> ownerId, Nullable<System.DateTime> inspectStopDate, string userId, Nullable<int> projectType, Nullable<System.DateTime> tNPDate, string contactFName, string contactMName, string contactLName, Nullable<int> companyId, string companyName, string address1, string address2, string city, string state, string postalCode, string phone, string fax)
        {
            var permit_NumberParameter = permit_Number != null ?
                new ObjectParameter("Permit_Number", permit_Number) :
                new ObjectParameter("Permit_Number", typeof(string));
    
            var permitTypeIdParameter = permitTypeId.HasValue ?
                new ObjectParameter("PermitTypeId", permitTypeId) :
                new ObjectParameter("PermitTypeId", typeof(int));
    
            var entryDateParameter = entryDate.HasValue ?
                new ObjectParameter("EntryDate", entryDate) :
                new ObjectParameter("EntryDate", typeof(System.DateTime));
    
            var applicationDateParameter = applicationDate.HasValue ?
                new ObjectParameter("ApplicationDate", applicationDate) :
                new ObjectParameter("ApplicationDate", typeof(System.DateTime));
    
            var effectiveDateParameter = effectiveDate.HasValue ?
                new ObjectParameter("EffectiveDate", effectiveDate) :
                new ObjectParameter("EffectiveDate", typeof(System.DateTime));
    
            var expirationDateParameter = expirationDate.HasValue ?
                new ObjectParameter("ExpirationDate", expirationDate) :
                new ObjectParameter("ExpirationDate", typeof(System.DateTime));
    
            var contactIdParameter = contactId.HasValue ?
                new ObjectParameter("ContactId", contactId) :
                new ObjectParameter("ContactId", typeof(int));
    
            var grantedToTextParameter = grantedToText != null ?
                new ObjectParameter("GrantedToText", grantedToText) :
                new ObjectParameter("GrantedToText", typeof(string));
    
            var timeTextParameter = timeText != null ?
                new ObjectParameter("TimeText", timeText) :
                new ObjectParameter("TimeText", typeof(string));
    
            var nightPermitParameter = nightPermit.HasValue ?
                new ObjectParameter("NightPermit", nightPermit) :
                new ObjectParameter("NightPermit", typeof(bool));
    
            var purposeParameter = purpose != null ?
                new ObjectParameter("Purpose", purpose) :
                new ObjectParameter("Purpose", typeof(string));
    
            var commentsParameter = comments != null ?
                new ObjectParameter("Comments", comments) :
                new ObjectParameter("Comments", typeof(string));
    
            var issueDateParameter = issueDate.HasValue ?
                new ObjectParameter("IssueDate", issueDate) :
                new ObjectParameter("IssueDate", typeof(System.DateTime));
    
            var authorizedSignatureIdParameter = authorizedSignatureId.HasValue ?
                new ObjectParameter("AuthorizedSignatureId", authorizedSignatureId) :
                new ObjectParameter("AuthorizedSignatureId", typeof(int));
    
            var decisionIdParameter = decisionId.HasValue ?
                new ObjectParameter("DecisionId", decisionId) :
                new ObjectParameter("DecisionId", typeof(short));
    
            var ownerIdParameter = ownerId.HasValue ?
                new ObjectParameter("OwnerId", ownerId) :
                new ObjectParameter("OwnerId", typeof(int));
    
            var inspectStopDateParameter = inspectStopDate.HasValue ?
                new ObjectParameter("InspectStopDate", inspectStopDate) :
                new ObjectParameter("InspectStopDate", typeof(System.DateTime));
    
            var userIdParameter = userId != null ?
                new ObjectParameter("UserId", userId) :
                new ObjectParameter("UserId", typeof(string));
    
            var projectTypeParameter = projectType.HasValue ?
                new ObjectParameter("ProjectType", projectType) :
                new ObjectParameter("ProjectType", typeof(int));
    
            var tNPDateParameter = tNPDate.HasValue ?
                new ObjectParameter("TNPDate", tNPDate) :
                new ObjectParameter("TNPDate", typeof(System.DateTime));
    
            var contactFNameParameter = contactFName != null ?
                new ObjectParameter("ContactFName", contactFName) :
                new ObjectParameter("ContactFName", typeof(string));
    
            var contactMNameParameter = contactMName != null ?
                new ObjectParameter("ContactMName", contactMName) :
                new ObjectParameter("ContactMName", typeof(string));
    
            var contactLNameParameter = contactLName != null ?
                new ObjectParameter("ContactLName", contactLName) :
                new ObjectParameter("ContactLName", typeof(string));
    
            var companyIdParameter = companyId.HasValue ?
                new ObjectParameter("CompanyId", companyId) :
                new ObjectParameter("CompanyId", typeof(int));
    
            var companyNameParameter = companyName != null ?
                new ObjectParameter("CompanyName", companyName) :
                new ObjectParameter("CompanyName", typeof(string));
    
            var address1Parameter = address1 != null ?
                new ObjectParameter("Address1", address1) :
                new ObjectParameter("Address1", typeof(string));
    
            var address2Parameter = address2 != null ?
                new ObjectParameter("Address2", address2) :
                new ObjectParameter("Address2", typeof(string));
    
            var cityParameter = city != null ?
                new ObjectParameter("City", city) :
                new ObjectParameter("City", typeof(string));
    
            var stateParameter = state != null ?
                new ObjectParameter("State", state) :
                new ObjectParameter("State", typeof(string));
    
            var postalCodeParameter = postalCode != null ?
                new ObjectParameter("PostalCode", postalCode) :
                new ObjectParameter("PostalCode", typeof(string));
    
            var phoneParameter = phone != null ?
                new ObjectParameter("Phone", phone) :
                new ObjectParameter("Phone", typeof(string));
    
            var faxParameter = fax != null ?
                new ObjectParameter("Fax", fax) :
                new ObjectParameter("Fax", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_SavePermitData", permit_NumberParameter, permitTypeIdParameter, entryDateParameter, applicationDateParameter, effectiveDateParameter, expirationDateParameter, contactIdParameter, grantedToTextParameter, timeTextParameter, nightPermitParameter, purposeParameter, commentsParameter, issueDateParameter, authorizedSignatureIdParameter, decisionIdParameter, ownerIdParameter, inspectStopDateParameter, userIdParameter, projectTypeParameter, tNPDateParameter, contactFNameParameter, contactMNameParameter, contactLNameParameter, companyIdParameter, companyNameParameter, address1Parameter, address2Parameter, cityParameter, stateParameter, postalCodeParameter, phoneParameter, faxParameter);
        }
    
        public virtual int sp_SavePermitEncroachment(string permit_Number, Nullable<short> seq_Num, Nullable<int> encroachmentTypeID, Nullable<double> length, Nullable<double> width, Nullable<double> height, Nullable<double> weight, Nullable<double> volume, Nullable<int> providerId, string description)
        {
            var permit_NumberParameter = permit_Number != null ?
                new ObjectParameter("Permit_Number", permit_Number) :
                new ObjectParameter("Permit_Number", typeof(string));
    
            var seq_NumParameter = seq_Num.HasValue ?
                new ObjectParameter("Seq_Num", seq_Num) :
                new ObjectParameter("Seq_Num", typeof(short));
    
            var encroachmentTypeIDParameter = encroachmentTypeID.HasValue ?
                new ObjectParameter("EncroachmentTypeID", encroachmentTypeID) :
                new ObjectParameter("EncroachmentTypeID", typeof(int));
    
            var lengthParameter = length.HasValue ?
                new ObjectParameter("Length", length) :
                new ObjectParameter("Length", typeof(double));
    
            var widthParameter = width.HasValue ?
                new ObjectParameter("Width", width) :
                new ObjectParameter("Width", typeof(double));
    
            var heightParameter = height.HasValue ?
                new ObjectParameter("Height", height) :
                new ObjectParameter("Height", typeof(double));
    
            var weightParameter = weight.HasValue ?
                new ObjectParameter("Weight", weight) :
                new ObjectParameter("Weight", typeof(double));
    
            var volumeParameter = volume.HasValue ?
                new ObjectParameter("Volume", volume) :
                new ObjectParameter("Volume", typeof(double));
    
            var providerIdParameter = providerId.HasValue ?
                new ObjectParameter("ProviderId", providerId) :
                new ObjectParameter("ProviderId", typeof(int));
    
            var descriptionParameter = description != null ?
                new ObjectParameter("Description", description) :
                new ObjectParameter("Description", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_SavePermitEncroachment", permit_NumberParameter, seq_NumParameter, encroachmentTypeIDParameter, lengthParameter, widthParameter, heightParameter, weightParameter, volumeParameter, providerIdParameter, descriptionParameter);
        }
    
        public virtual int sp_SavePermitLocations(string permit_Number, Nullable<int> seq_Num, Nullable<short> occupancyTypeID, Nullable<int> onSTCODE, Nullable<int> fromSTCODE, Nullable<int> toSTCODE, string onActual, string fromActual, string toActual, string high_Traffic_Area, Nullable<int> referenceTypeID, string referenceValue)
        {
            var permit_NumberParameter = permit_Number != null ?
                new ObjectParameter("Permit_Number", permit_Number) :
                new ObjectParameter("Permit_Number", typeof(string));
    
            var seq_NumParameter = seq_Num.HasValue ?
                new ObjectParameter("Seq_Num", seq_Num) :
                new ObjectParameter("Seq_Num", typeof(int));
    
            var occupancyTypeIDParameter = occupancyTypeID.HasValue ?
                new ObjectParameter("OccupancyTypeID", occupancyTypeID) :
                new ObjectParameter("OccupancyTypeID", typeof(short));
    
            var onSTCODEParameter = onSTCODE.HasValue ?
                new ObjectParameter("OnSTCODE", onSTCODE) :
                new ObjectParameter("OnSTCODE", typeof(int));
    
            var fromSTCODEParameter = fromSTCODE.HasValue ?
                new ObjectParameter("FromSTCODE", fromSTCODE) :
                new ObjectParameter("FromSTCODE", typeof(int));
    
            var toSTCODEParameter = toSTCODE.HasValue ?
                new ObjectParameter("ToSTCODE", toSTCODE) :
                new ObjectParameter("ToSTCODE", typeof(int));
    
            var onActualParameter = onActual != null ?
                new ObjectParameter("OnActual", onActual) :
                new ObjectParameter("OnActual", typeof(string));
    
            var fromActualParameter = fromActual != null ?
                new ObjectParameter("FromActual", fromActual) :
                new ObjectParameter("FromActual", typeof(string));
    
            var toActualParameter = toActual != null ?
                new ObjectParameter("ToActual", toActual) :
                new ObjectParameter("ToActual", typeof(string));
    
            var high_Traffic_AreaParameter = high_Traffic_Area != null ?
                new ObjectParameter("High_Traffic_Area", high_Traffic_Area) :
                new ObjectParameter("High_Traffic_Area", typeof(string));
    
            var referenceTypeIDParameter = referenceTypeID.HasValue ?
                new ObjectParameter("ReferenceTypeID", referenceTypeID) :
                new ObjectParameter("ReferenceTypeID", typeof(int));
    
            var referenceValueParameter = referenceValue != null ?
                new ObjectParameter("ReferenceValue", referenceValue) :
                new ObjectParameter("ReferenceValue", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_SavePermitLocations", permit_NumberParameter, seq_NumParameter, occupancyTypeIDParameter, onSTCODEParameter, fromSTCODEParameter, toSTCODEParameter, onActualParameter, fromActualParameter, toActualParameter, high_Traffic_AreaParameter, referenceTypeIDParameter, referenceValueParameter);
        }
    
        public virtual int sp_SavePermitLocGIS(string permit_Number, Nullable<short> seq_Num, Nullable<int> lElementTypeID, Nullable<int> element_Id)
        {
            var permit_NumberParameter = permit_Number != null ?
                new ObjectParameter("Permit_Number", permit_Number) :
                new ObjectParameter("Permit_Number", typeof(string));
    
            var seq_NumParameter = seq_Num.HasValue ?
                new ObjectParameter("Seq_Num", seq_Num) :
                new ObjectParameter("Seq_Num", typeof(short));
    
            var lElementTypeIDParameter = lElementTypeID.HasValue ?
                new ObjectParameter("lElementTypeID", lElementTypeID) :
                new ObjectParameter("lElementTypeID", typeof(int));
    
            var element_IdParameter = element_Id.HasValue ?
                new ObjectParameter("Element_Id", element_Id) :
                new ObjectParameter("Element_Id", typeof(int));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_SavePermitLocGIS", permit_NumberParameter, seq_NumParameter, lElementTypeIDParameter, element_IdParameter);
        }
    
        public virtual int sp_SavePermitReferences(string permit_Number, Nullable<short> seq_Num, Nullable<int> referenceTypeID, string referenceValue)
        {
            var permit_NumberParameter = permit_Number != null ?
                new ObjectParameter("Permit_Number", permit_Number) :
                new ObjectParameter("Permit_Number", typeof(string));
    
            var seq_NumParameter = seq_Num.HasValue ?
                new ObjectParameter("Seq_Num", seq_Num) :
                new ObjectParameter("Seq_Num", typeof(short));
    
            var referenceTypeIDParameter = referenceTypeID.HasValue ?
                new ObjectParameter("ReferenceTypeID", referenceTypeID) :
                new ObjectParameter("ReferenceTypeID", typeof(int));
    
            var referenceValueParameter = referenceValue != null ?
                new ObjectParameter("ReferenceValue", referenceValue) :
                new ObjectParameter("ReferenceValue", typeof(string));
    
            return ((IObjectContextAdapter)this).ObjectContext.ExecuteFunction("sp_SavePermitReferences", permit_NumberParameter, seq_NumParameter, referenceTypeIDParameter, referenceValueParameter);
        }
    }
}
