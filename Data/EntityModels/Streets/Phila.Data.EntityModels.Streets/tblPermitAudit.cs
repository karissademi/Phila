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
    
    public partial class tblPermitAudit
    {
        public string Permit_Number { get; set; }
        public System.DateTime RecTimeStamp { get; set; }
        public Nullable<System.DateTime> EffectiveDate { get; set; }
        public Nullable<System.DateTime> ExpirationDate { get; set; }
        public string GrantedToText { get; set; }
        public string TimeText { get; set; }
        public string Purpose { get; set; }
        public string Comments { get; set; }
        public Nullable<short> DecisionId { get; set; }
        public string Permit_UserId { get; set; }
        public System.DateTime Permit_DateTime { get; set; }
    }
}
