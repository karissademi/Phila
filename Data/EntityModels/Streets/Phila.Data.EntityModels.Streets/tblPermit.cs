//------------------------------------------------------------------------------
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
    using System.Collections.Generic;
    
    public partial class tblPermit
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public tblPermit()
        {
            this.tblPermit_CCs = new HashSet<tblPermit_CCs>();
            this.tblPermit_Districts = new HashSet<tblPermit_Districts>();
            this.tblPermit_Encroachment = new HashSet<tblPermit_Encroachment>();
            this.tblPermit_Locations = new HashSet<tblPermit_Locations>();
            this.tblPermit_Reasons = new HashSet<tblPermit_Reasons>();
            this.tblPermit_Remarks = new HashSet<tblPermit_Remarks>();
            this.Documents = new HashSet<Document>();
            this.tblPermit_References = new HashSet<tblPermit_References>();
            this.tblPermit_Extensions = new HashSet<tblPermit_Extensions>();
        }
    
        public string Permit_Number { get; set; }
        public Nullable<int> PermitTypeId { get; set; }
        public Nullable<System.DateTime> EntryDate { get; set; }
        public Nullable<System.DateTime> ApplicationDate { get; set; }
        public Nullable<System.DateTime> EffectiveDate { get; set; }
        public Nullable<System.DateTime> ExpirationDate { get; set; }
        public Nullable<int> ContactId { get; set; }
        public string GrantedToText { get; set; }
        public string TimeText { get; set; }
        public Nullable<bool> NightPermit { get; set; }
        public string Purpose { get; set; }
        public string Comments { get; set; }
        public Nullable<System.DateTime> IssueDate { get; set; }
        public Nullable<int> AuthorizedSignatureId { get; set; }
        public Nullable<short> DecisionId { get; set; }
        public Nullable<int> OwnerId { get; set; }
        public Nullable<System.DateTime> InspectorStopDate { get; set; }
        public Nullable<int> ProjectType { get; set; }
        public Nullable<System.DateTime> TNPDate { get; set; }
        public string Rec_UserId { get; set; }
        public System.DateTime Rec_DateTime { get; set; }
        public string Contact_First_Name { get; set; }
        public string Contact_Mid_Name { get; set; }
        public string Contact_Last_Name { get; set; }
        public Nullable<int> CompanyId { get; set; }
        public string Company_Name { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Phone { get; set; }
        public string Fax { get; set; }
    
        public virtual tblDecision tblDecision { get; set; }
        public virtual tblOwner tblOwner { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_CCs> tblPermit_CCs { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_Districts> tblPermit_Districts { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_Encroachment> tblPermit_Encroachment { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_Locations> tblPermit_Locations { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_Reasons> tblPermit_Reasons { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_Remarks> tblPermit_Remarks { get; set; }
        public virtual tblPermitType tblPermitType { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Document> Documents { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_References> tblPermit_References { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblPermit_Extensions> tblPermit_Extensions { get; set; }
        public virtual tblContact tblContact { get; set; }
    }
}
