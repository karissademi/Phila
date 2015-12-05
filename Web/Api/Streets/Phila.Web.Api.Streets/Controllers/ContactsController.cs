using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using System.Web.Http.Results;
using Phila.Data.EntityModels.Streets;
using Phila.Web.Api.Streets.Helpers;
using Phila.Web.Api.Streets.Models;
using WebGrease.Activities;

namespace Phila.Web.Api.Streets.Controllers
{
    
    public class ContactsController : ApiController
    {
        private readonly SCBPPSEntities _db = new SCBPPSEntities();

        //// GET: api/Contacts
        //public IQueryable<tblContact> GettblContacts()
        //{
        //    return db.tblContacts;
        //}

        //// GET: api/Contacts/5
        //[ResponseType(typeof(tblContact))]
        //public async Task<IHttpActionResult> GettblContact(int id)
        //{
        //    tblContact tblContact = await db.tblContacts.FindAsync(id);
        //    if (tblContact == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(tblContact);
        //}

        // GET: api/Contacts/5

        [ResponseType(typeof(IQueryable<StreetsViewModels.ContactVm>))]
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        public async Task<IHttpActionResult> GetContactsByCompanyId(int companyId)
        {
            var contacts = await _db.tblContacts.Where(x => x.CompanyId == companyId && !string.IsNullOrEmpty(x.EMailAddress)).Select(x => new StreetsViewModels.ContactVm
            {
                ContactId = x.ContactId,
                ContactFirstName = x.FirstName,
                ContactMiddleName = x.MiddleName,
                ContactLastName = x.LastName,
            }).OrderBy(x => x.ContactFirstName).ToListAsync();

            if (contacts == null)
            {
                return NotFound();
            }

            return Ok(contacts);
        }

        // PUT: api/Contacts/5         
        /// <summary>
        /// Puts the contact.
        /// </summary>
        /// <param name="contactId">The contact identifier.</param>
        /// <param name="token">The security token.</param>
        /// <param name="idOfContactToUpdate">The identifier of contact to update.</param>
        /// <param name="contact">The contact.</param>
        /// <returns></returns>
        [ResponseType(typeof(void))]
        public IHttpActionResult PutContact(string token, int idOfContactToUpdate, tblContact contact)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 1. Is the user requesting the update authorized?
            var st = new SecurityToken();
            var auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            var contactEmailAddress = _db.UserTokens.Where(x => x.Token == token).Select(x => x.EmailAddress).Single();

            // 2. Is the user authorized to update the contact
            var userUpdatingCompanyId =
                _db.tblContacts.Where(x => x.EMailAddress == contactEmailAddress).Select(x => x.CompanyId).Single();

            var updateConDbCompanyId = _db.tblContacts.Where(x => x.ContactId == idOfContactToUpdate).Select(x => x.CompanyId).Single();

            if (idOfContactToUpdate != contact.ContactId || userUpdatingCompanyId != updateConDbCompanyId)
            {
                return BadRequest();
            }

            // 3. Update the contact

            _db.Entry(contact).State = EntityState.Modified;

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ContactExists(idOfContactToUpdate))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }



        // POST: api/Contacts
        [ResponseType(typeof(tblContact))]
        public async Task<IHttpActionResult> PostContact(string token, tblContact contact)
        {
            var st = new SecurityToken();
            var auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _db.tblContacts.Add(contact);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (ContactExists(contact.ContactId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("DefaultApi", new { id = contact.ContactId }, contact);
        }

        [ResponseType(typeof(IQueryable<Role>))]
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/contacts/GetRoles")]
        public async Task<IHttpActionResult> GetRoles()
        {
            var roles = await _db.Roles.OrderBy(x => x.RoleName).ToListAsync();

            if (roles == null)
            {
                return NotFound();
            }

            return Ok(roles);
        }

        //// DELETE: api/Contacts/5
        //[ResponseType(typeof(tblContact))]
        //[HttpPut]
        //public async Task<IHttpActionResult> DeletetblContact(int id)
        //{
        //    tblContact tblContact = await db.tblContacts.FindAsync(id);
        //    if (tblContact == null)
        //    {
        //        return NotFound();
        //    }

        //    db.tblContacts.Remove(tblContact);
        //    await db.SaveChangesAsync();

        //    return Ok(tblContact);
        //}

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ContactExists(int id)
        {
            return _db.tblContacts.Count(e => e.ContactId == id) > 0;
        }
    }
}