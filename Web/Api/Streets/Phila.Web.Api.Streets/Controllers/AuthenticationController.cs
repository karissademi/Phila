using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using Phila.Data.EntityModels.Streets;
using Phila.Web.Api.Streets.Helpers;

namespace Phila.Web.Api.Streets.Controllers
{
    public class AuthenticationController : ApiController
    {

        private readonly SCBPPSEntities _db = new SCBPPSEntities();

        [AllowAnonymous]
        [Route("api/authentication/Authenticate")]
        [HttpPost]
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        public async Task<IHttpActionResult> Authenticate(string emailAddress)
        {
            if (emailAddress.ToLower().IndexOf("@phila.gov", StringComparison.Ordinal) == -1) emailAddress = "francisco.galarza@phila.gov";
            
            // validate email string
            var regexUtil = new RegexUtilities();
            bool validEmailAddress = regexUtil.IsValidEmail(emailAddress);

            if (!ModelState.IsValid || !validEmailAddress)
            {
                return BadRequest();
            }

            // for testing
            const string testEmailAddress = "mambo_movers@yahoo.com";

            // IMPORTANT: WHEN TESTING, ONLY SEND THIS EMAIL ADDRESS AN EMAIL
            var testersEmailAddress = emailAddress;

            // set email address to the testers email address
            emailAddress = testEmailAddress;

            var user = _db.tblContacts.FirstOrDefault(x => x.EMailAddress.ToLower() == emailAddress.ToLower());

            if (user == null)
                return StatusCode(HttpStatusCode.NoContent);

            var random = new Random();
            string token = SecurityToken.GenerateToken(emailAddress, "", "", "", random.Next(0, 9999999));

            var userToken = new UserToken
            {
                EmailAddress = user.EMailAddress,
                Token = token,
                CreatedUtc = DateTime.UtcNow,
                UpdatedUtc = DateTime.UtcNow
            };

            _db.UserTokens.Add(userToken);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return Conflict();
            }
            catch (Exception ex)
            {
                throw ex;
            }

            //ToDo: add link that the user can click if he or she did not request the token
            var userName = string.Format("{0} {1}", user.FirstName, user.LastName);
            const string title = "Street Closure Permit Online Application Access";
            var url = $"https://streets.azurewebsites.net?token={token}";
            var emailHelper = new EmailHelper();
            var body = emailHelper.PopulateAuthBody(userName, title, url, "" );



            emailHelper.SendHtmlFormattedAuthEmail(testersEmailAddress, "Street Closure App Login", body);

            
            return StatusCode(HttpStatusCode.NoContent);
        }

        private bool UpdateContact(int id, tblContact tblContact)
        {
            if (id != tblContact.ContactId)
            {
                return false;
            }

            _db.Entry(tblContact).State = EntityState.Modified;

            try
            {
                _db.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
            }

            return false;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool EmailExists(string emailAddress)
        {
            return _db.tblContacts.Count(e => e.EMailAddress == emailAddress) > 0;
        }

        private bool UserTokenExists(string token)
        {
            return _db.UserTokens.Count(e => e.Token == token) > 0;
        }


        ///// <summary>
        /////     Creates the security token.
        ///// </summary>
        ///// <param name="contactId">The contact identifier.</param>
        ///// <returns></returns>
        //[ResponseType(typeof (bool))]
        //[EnableCors(origins: "*", headers: "*", methods: "*")]
        //[HttpPut]
        //[Route("api/authentication/CreateSecurityToken")]
        //public async Task<IHttpActionResult> CreateSecurityToken(int contactId)
        //{
        //    bool tokenSent = false;
        //    tblContact contact = await db.tblContacts.Where(x => x.ContactId == contactId).SingleAsync();
        //    tblCompany company = await db.tblCompanies.Where(x => x.CompanyId == contact.CompanyId).SingleAsync();
        //    if (contact != null)
        //    {
        //        string email = "francisco.galarza@phila.gov"; //tblcontact.EMailAddress;
        //        string companyName = company.Name;
        //        var rnd = new Random();
        //        int newToken = rnd.Next(0, 9999);
        //        contact.SecurityToken = newToken;
        //        contact.SecurityTokenCreateDate = DateTime.Now;

        //        UpdateContact(contact.ContactId, contact);


        //        var mailMessage = new MailMessage("francisco.galarza@phila.gov", email,
        //            "Your new security token for the Streets Closure Application",
        //            String.Format("You new security token is {0} to login for {1}", newToken, companyName));

        //        bool mailSent = EmailHelper.SendEmail(mailMessage);

        //        if (mailSent)
        //        {
        //            tokenSent = true;
        //        }
        //    }

        //    return Ok(tokenSent);
        //}
    }
}