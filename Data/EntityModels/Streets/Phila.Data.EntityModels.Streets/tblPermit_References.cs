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
    
    public partial class tblPermit_References
    {
        public string Permit_Number { get; set; }
        public short Seq_Num { get; set; }
        public Nullable<int> ReferenceTypeID { get; set; }
        public string ReferenceValue { get; set; }
    
        public virtual tblPermit tblPermit { get; set; }
        public virtual tblReferenceType tblReferenceType { get; set; }
    }
}
