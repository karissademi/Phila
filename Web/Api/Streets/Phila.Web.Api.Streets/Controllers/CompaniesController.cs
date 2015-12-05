using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using Newtonsoft.Json;
using Phila.Data.EntityModels.Streets;
using Phila.Web.Api.Streets.Helpers;
using Phila.Web.Api.Streets.Models;

namespace Phila.Web.Api.Streets.Controllers
{
    public class CompaniesController : ApiController
    {
        private readonly SCBPPSEntities db = new SCBPPSEntities();

        // GET: api/Companies
        /// <summary>
        ///     Gets the companies.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        //[AllowAnonymous]
        public async Task<IHttpActionResult> GetCompanies()
        {
            List<StreetsViewModels.CompanyVm> companies =
                await db.tblCompanies.Take(50).OrderBy(x => x.Name).Select(x => new StreetsViewModels.CompanyVm
                {
                    CompanyId = x.CompanyId,
                    CompanyName = x.Name
                }).ToListAsync();

            return Ok(companies);
        }


        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [HttpGet]
        [Route("api/Permits/GetCompanyByCompanyId")]
        public async Task<IHttpActionResult> GetCompanyByCompanyId(string token, int companyId)
        {
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            string contactEmailAddress =
                db.UserTokens.Where(x => x.Token == token).Select(x => x.EmailAddress).FirstOrDefault();

            // get users company ids
            List<int?> companyIds =
                db.tblContacts.Where(x => x.EMailAddress == contactEmailAddress).Select(x => x.CompanyId).ToList();

            // is the user auth to get permits of companyId?
            if (companyIds.IndexOf(companyId) == -1)
            {
                return Unauthorized();
            }

            StreetsViewModels.CompanyDetailsVm company =
                await
                    db.tblCompanies.Where(x => x.CompanyId == companyId)
                        .Select(x => new StreetsViewModels.CompanyDetailsVm
                        {
                            CompanyId = x.CompanyId,
                            CompanyName = x.Name,
                            Website = x.Website,
                            CompanyPhoneNumber = x.Phone,
                            CompanyFaxNumber = x.Fax,
                            BillingStreetAddress1 = x.Address1,
                            BillingStreetAddress2 = x.Address2,
                            BillingStreetAddress3 = x.Address3,
                            BillingCity = x.City,
                            BillingState = x.State,
                            BillingZipCode = x.PostalCode
                        }).FirstOrDefaultAsync();

            if (company == null)
            {
                return NotFound();
            }

            return Ok(company);
        }

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        //[AllowAnonymous]
        [Route("api/companies/GetCompaniesAutocomplete")]
        public async Task<IHttpActionResult> GetCompaniesAutocomplete(string companyName)
        {
            List<StreetsViewModels.CompanyVm> companies =
                await
                    db.tblCompanies.Where(x => x.Name.Contains(companyName))
                        .Take(10)
                        .OrderBy(x => x.Name)
                        .Select(x => new StreetsViewModels.CompanyVm
                        {
                            CompanyId = x.CompanyId,
                            CompanyName = x.Name
                        }).ToListAsync();

            return Ok(companies);
        }

        /// <summary>
        /// Gets the users companies.
        /// </summary>
        /// <param name="token">The token.</param>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/companies/GetUsersCompanies")]
        public async Task<IHttpActionResult> GetUsersCompanies(string token)
        {
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            var usersCompanies = UsersCompany(token);


            //// get users company ids
            //List<int?> companyIds =
            //    db.tblContacts.Where(x => x.ContactId == contactId).Select(x => x.CompanyId).ToList();

            //// is the user auth to get permits of companyId?
            //if (companyIds.IndexOf((int?)companyId) == -1)
            //{
            //    return Unauthorized();
            //}

            //var companies = await db.tblCompanies.Where(x => x.Name.Contains(companyName)).Take(10).OrderBy(x => x.Name).Select(x => new StreetsViewModels.CompanyVm
            //{
            //    CompanyId = x.CompanyId,
            //    CompanyName = x.Name
            //}).ToListAsync();

            return Ok(usersCompanies);
        }

        internal IQueryable<StreetsViewModels.UsersCompanyViewModel> UsersCompany(string token)
        {
            string contactEmailAddress =
                db.UserTokens.Where(x => x.Token == token).Select(x => x.EmailAddress).FirstOrDefault();

            IQueryable<StreetsViewModels.UsersCompanyViewModel> usersCompanies =
                db.tblCompanies.Join(db.tblContacts.Where(x => x.EMailAddress == contactEmailAddress),
                    companies => companies.CompanyId,
                    contacts => contacts.CompanyId, (companies, contacts) => new StreetsViewModels.UsersCompanyViewModel
                    {
                        CompanyDetailsVm = new StreetsViewModels.CompanyDetailsVm
                        {
                            CompanyId = companies.CompanyId,
                            CompanyName = companies.Name,
                            CompanyPhoneNumber = companies.Phone,
                            CompanyFaxNumber = companies.Fax,
                            Website = companies.Website,
                            BillingStreetAddress1 = companies.Address1,
                            BillingStreetAddress2 = companies.Address2,
                            BillingStreetAddress3 = companies.Address3,
                            BillingCity = companies.City,
                            BillingState = companies.State,
                            BillingZipCode = companies.PostalCode,
                            PhiladelphiaTaxId = companies.Philadelphia_TaxId
                        },
                        ContactDetailsVm = new StreetsViewModels.ContactDetailsVm
                        {
                            ContactId = contacts.ContactId,
                            ContactFirstName = contacts.FirstName,
                            ContactLastName = contacts.LastName,
                            Username = contacts.RecCreateUserId,
                            ContactPhoneNumber = contacts.Phone,
                            ContactEmailAddress = contacts.EMailAddress,
                        }
                    });
            return usersCompanies;
        }

        //// PUT: api/Companies/5
        //[ResponseType(typeof(void))]
        //public async Task<IHttpActionResult> PuttblCompany(int id, tblCompany tblCompany)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (id != tblCompany.CompanyId)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(tblCompany).State = EntityState.Modified;

        //    try
        //    {
        //        await db.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!tblCompanyExists(id))
        //        {
        //            return NotFound();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return StatusCode(HttpStatusCode.NoContent);
        //}

        // POST: api/Companies        
        /// <summary>
        ///     Posts the company.
        /// </summary>
        /// <param name="newCompany">The new company.</param>
        /// <param name="newContact">The new contact.</param>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        //[AllowAnonymous]
        [Route("api/companies/CreateCompany")]
        [HttpPost]
        public async Task<IHttpActionResult> CreateCompany(dynamic data)
        {
            dynamic companyInfo =
                JsonConvert.DeserializeObject<StreetsViewModels.CompanyDetailsVm>(data.newCompany.ToString());

            dynamic contactInfo =
                JsonConvert.DeserializeObject<StreetsViewModels.ContactDetailsVm>(data.newContact.ToString());

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (companyInfo == null || contactInfo == null)
            {
                return BadRequest();
            }

            dynamic messageSb = CompanyInfoEmail(companyInfo, contactInfo);

            var mailMessage = new MailMessage("francisco.galarza@phila.gov", "francisco.galarza@phila.gov",
                "Request for new Company for Streets Closure Application", messageSb.ToString());

            EmailHelper.SendEmail(mailMessage);

            return Ok();
        }

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        //[AllowAnonymous]
        [Route("api/companies/UpdateCompanyInfo")]
        [HttpPost]
        public async Task<IHttpActionResult> UpdateCompanyInfo(string token, StreetsViewModels.CompanyDetailsVm company)
        {
            // 1. Is the user requesting the update authorized?
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            string contactEmailAddress = db.UserTokens.Where(x => x.Token == token).Select(x => x.EmailAddress).Single();

            int? companyId = company.CompanyId;

            tblContact uCompanyId =
                db.tblContacts.Single(x => x.CompanyId == companyId && x.EMailAddress == contactEmailAddress);

            if (companyId != uCompanyId.CompanyId)
            {
                return Unauthorized();
            }

            StringBuilder messageSb = CompanyInfoEmail(company, contact: null);

            var mailMessage = new MailMessage("francisco.galarza@phila.gov", "francisco.galarza@phila.gov",
                "Request for new Company for Streets Closure Application", messageSb.ToString());

            EmailHelper.SendEmail(mailMessage);

            return Ok();
        }

        private static StringBuilder CompanyInfoEmail(StreetsViewModels.CompanyDetailsVm company,
            StreetsViewModels.ContactDetailsVm contact = null)
        {
            var messageSb = new StringBuilder();
            messageSb.AppendLine("Request for new Company");
            messageSb.AppendLine("Company ID: " + company.CompanyId);
            messageSb.AppendLine("Company Name: " + company.CompanyName);
            messageSb.AppendLine("Tax ID: " + company.PhiladelphiaTaxId);
            messageSb.AppendLine("Web Site: " + company.Website);
            messageSb.AppendLine("Phone: " + company.CompanyPhoneNumber);
            messageSb.AppendLine("Address: " + company.BillingStreetAddress1);
            messageSb.AppendLine("Address 2:" + company.BillingStreetAddress2);
            messageSb.AppendLine("Address 3: " + company.BillingStreetAddress3);
            messageSb.AppendLine("City: " + company.BillingCity);
            messageSb.AppendLine("State: " + company.BillingState);
            messageSb.AppendLine("Zip: " + company.BillingZipCode);
            messageSb.AppendLine("");
            if (contact == null)
                return messageSb;

            messageSb.AppendLine("Contact Information");
            messageSb.AppendLine("First Name: " + contact.ContactFirstName);
            messageSb.AppendLine("Middle: " + contact.ContactMiddleName);
            messageSb.AppendLine("Last: " + contact.ContactLastName);
            messageSb.AppendLine("Email: " + contact.ContactEmailAddress);
            messageSb.AppendLine("Work Phone: " + contact.ContactMobilePhoneNumber);
            messageSb.AppendLine("Cell Phone: " + contact.ContactMobilePhoneNumber);
            return messageSb;
        }


        //// DELETE: api/Companies/5
        //[ResponseType(typeof(tblCompany))]
        //public async Task<IHttpActionResult> DeletetblCompany(int id)
        //{
        //    tblCompany tblCompany = await db.tblCompanies.FindAsync(id);
        //    if (tblCompany == null)
        //    {
        //        return NotFound();
        //    }

        //    db.tblCompanies.Remove(tblCompany);
        //    await db.SaveChangesAsync();

        //    return Ok(tblCompany);
        //}

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool tblCompanyExists(int id)
        {
            return db.tblCompanies.Count(e => e.CompanyId == id) > 0;
        }
    }
}