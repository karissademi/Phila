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
    
    public partial class tblStatusCode
    {
        public int status_code_id { get; set; }
        public string status_code_description { get; set; }
        public Nullable<bool> active { get; set; }
        public Nullable<System.DateTime> last_activity_date { get; set; }
        public byte[] timestamp { get; set; }
    }
}
