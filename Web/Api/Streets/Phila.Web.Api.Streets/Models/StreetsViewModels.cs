using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNet.Identity;
using Phila.Data.EntityModels.Streets;

namespace Phila.Web.Api.Streets.Models
{
    public class StreetsViewModels
    {
        public class CompanyVm
        {
            public int? CompanyId { get; set; }
            public string CompanyName { get; set; }
        }

        public class CompanyDetailsVm : CompanyVm
        {
            public string Website { get; set; }
            public string CompanyPhoneNumber { get; set; }
            public string CompanyFaxNumber { get; set; }
            public string BillingStreetAddress1 { get; set; }
            public string BillingStreetAddress2 { get; set; }
            public string BillingStreetAddress3 { get; set; }
            public string BillingCity { get; set; }
            public string BillingState { get; set; }
            public string BillingZipCode { get; set; }
            public string PhiladelphiaTaxId { get; set; }
        }


        public class ContactVm
        {
            public int ContactId { get; set; }
            public string ContactFirstName { get; set; }
            public string ContactMiddleName { get; set; }
            public string ContactLastName { get; set; }
            public string Username { get; set; }
        }

        public class ContactDetailsVm : ContactVm
        {
            public string ContactPhoneNumber { get; set; }
            public string ContactMobilePhoneNumber { get; set; }
            public string ContactEmailAddress { get; set; }
            public bool Active { get; set; }
            public List<Role> ContactRoles { get; set; }           
        }

        public class PermitVm
        {
            public string PermitId { get; set; }
            public string PermitStatus { get; set; }

            [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
            public DateTime? StartDate { get; set; }

            [DisplayFormat(DataFormatString = "{0:yyyy-MM-dd}", ApplyFormatInEditMode = true)]
            public DateTime? EndDate { get; set; }

            public string Purpose { get; set; }
            public int? PermitTypeId { get; set; }
            public string Comments { get; set; }
            public int? ProjectTypes { get; set; }
            public int[] EncroachmentTypes { get; set; }
            public List<PostedLocation> Locations { get; set; } 
            
            public string PermitLocation { get; set; }

            public List<PostedReference> References { get; set; } 

        }

        public class PermitsPage
        {
            public List<PostedPermit> Permits { get; set; }
            public int TotalPermits { get; set; }
            public int PageSize { get; set; }
            public int TotalPages { get; set; }
            public int CurrentPage { get; set; }
            public string SortedBy { get; set; }
            public string SortDirection { get; set; }
            public string FilteredBy { get; set; }
            public string SearchString { get; set; }
        }

        public class PermitTypeVm
        {
            public int PermitTypeId { get; set; }
            public string PermitTypeName { get; set; }
            public string PermitTypeAbbrev { get; set; }
            public Nullable<bool> EncroachmentRequired { get; set; }
        }

        public class StatusCodesVm
        {
            public int StatusCodeId { get; set; }
            public string StatusCodeName { get; set; }
        }

        public class StatusSummary : StatusCodesVm
        {
            public int TotalPermits { get; set; }

        }

        public class UsersCompanyViewModel
        {
            public CompanyDetailsVm CompanyDetailsVm { get; set; }
            public ContactDetailsVm ContactDetailsVm { get; set; }
        }

        public class LocationDetails
        {
            public int? StreetCode { get; set; }
            public int? SegmentId { get; set; }
        }

        public class StreetClosureViewModel
        {
            public IQueryable<StreetsViewModels.UsersCompanyViewModel> UsersCompanyViewModel { get; set; }
            public IQueryable<tblProjectType> ProjectTypes { get; set; }
            public IQueryable<tblReferenceType> ReferenceTypes { get; set; }
            public IQueryable<tblEncroachmentType> EncroachmentTypes { get; set; }
            public IQueryable<PermitTypeVm> PermitTypeVms { get; set; }
            public IQueryable<tblOwner> UtilityOwners { get; set; }
            public IQueryable<tblOccupancyType> OccupancyTypes { get; set; }
        }

        public class Street
        {
            public string StreetName { get; set; }
        }


        public class ReferenceSelection
        {
            public int ReferenceTypeId { get; set; }
            public string ReferenceValue { get; set; }    
        }

        public class PostedPermit
        {
            public string PermitNumber { get; set; }
            public string Token { get; set; }
            public int? CompanyId { get; set; }
            public string CompanyName { get; set; }
            public int? UtilityOwnerId { get; set; }
            public int? PermitTypeId { get; set; }
            public int? ProjectTypes { get; set; }
            public List<int> EncroachmentTypes { get; set; }
            public DateTime? EffectiveDate { get; set; }
            public DateTime? ExpirationDate { get; set; }
            public string Purpose { get; set; }
            public string Comments { get; set; }
            public bool IsDraft { get; set; }
            public string PermitStatus { get; set; }
            public List<PostedReference> References { get; set; }
            public List<PostedLocation> Locations { get; set; }

        }

        public class PostedReference
        {
            public int? ReferenceTypeId { get; set; }
            public string ReferenceValue { get; set; }
        }

        public class PostedLocation
        {
            public int SequenceNumber { get; set; }
            public int OccupancyTypeId { get; set; }
            public string LocationType { get; set; }
            public string OnStreetName { get; set; }
            public int? OnStreetCode { get; set; }
            public string FromStreetName { get; set; }
            public int? FromStreetCode { get; set; }
            public int? FromStreetNode { get; set; }
            public string ToStreetName { get; set; }
            public int? ToStreetCode { get; set; }
            public int? ToStreetNode { get; set; }
        }

//            ReferenceTypeId		{3}
		
//ReferenceTypeId	:	6
		
//ReferenceTypeName	:	Health Dept Permit Number
		
//ReferenceValue	:	null
		
//ReferenceValue	:	24213gagretwert

    }

    //[MetadataType(typeof(tblCompanyMetaData))]
    //public partial class tblCompany
    //{
    //}

    //public class tblCompanyMetaData
    //{
        
    //}

    //[MetadataType(typeof(tblContactMetaData))]
    //public partial class tblContact
    //{
    //}

    //public class tblContactMetaData
    //{
    //}
}
