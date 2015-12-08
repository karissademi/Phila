using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using Microsoft.Ajax.Utilities;
using Phila.Data.EntityModels.Streets;
using Phila.Web.Api.Streets.Helpers;
using Phila.Web.Api.Streets.Models;

namespace Phila.Web.Api.Streets.Controllers
{
    /// <summary>
    /// </summary>
    //[Authorize(Roles = "Administrator, Streets")]
    public class PermitsController : ApiController
    {
        private readonly SCBPPSEntities _db = new SCBPPSEntities();


        /// <summary>
        /// Posts the permit.
        /// </summary>
        /// <param name="tblPermit">The table permit.</param>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/CreatePermit")]
        public async Task<IHttpActionResult> CreatePermit(string token, int companyId, int utilityOwnerId,
            DateTime? effectiveDate, DateTime? expirationDate, string purpose, int[] encroachmentTypes, int projectTypes, int permitTypeId, string comments, bool isDraft)//, List<StreetsViewModels.ReferenceSelection> references)
        {
            //if (encroachmentTypes == null) throw new ArgumentNullException("encroachmentTypes");
            
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
                return Unauthorized();

            var validCompanyId = IsCompanyIdValid(token, companyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
                return Unauthorized();


            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var company = _db.tblCompanies.FirstOrDefault(x => x.CompanyId == companyId);
            if (company == null)
                return Unauthorized();

            var user = _db.UserTokens.FirstOrDefault(x => x.Token == token);
            if (user == null)
                return Unauthorized();

            var userInfo = _db.tblContacts.FirstOrDefault(x => x.EMailAddress == user.EmailAddress);

            if (userInfo == null)
                return Unauthorized();

            var newPermit = new tblPermit
            {
                ApplicationDate = DateTime.Now,
                EntryDate = DateTime.Now,
                OwnerId = utilityOwnerId,
                CompanyId = companyId,
                Comments = comments,
                EffectiveDate = effectiveDate,
                ExpirationDate = expirationDate,
                Permit_Number = GetNewPermitNumber(),
                Purpose = purpose,
                DecisionId = isDraft == false ? (short)3 : (short)8,
                ProjectType = projectTypes,
                Rec_DateTime = DateTime.Now,
                PermitTypeId = permitTypeId,
                Company_Name = company.Name,
                Address1 = company.Address1,
                Address2 = company.Address2,
                City = company.City,
                State = company.State,
                PostalCode = company.PostalCode,
                Phone = company.Phone,
                Fax = company.Fax,
                Contact_First_Name = userInfo.FirstName,
                Contact_Mid_Name = userInfo.MiddleName,
                Contact_Last_Name = userInfo.LastName,
                ContactId = userInfo.ContactId//,
                //Rec_UserId = user.EmailAddress
            };

            try
            {
                _db.tblPermits.Add(newPermit);

                //var encroachments = new List<tblPermit_Encroachment>();
                //for (int i = 0; i < encroachmentTypes.Length; i++)
                //{
                //    var seq = i + 1;
                //    encroachments.Add(new tblPermit_Encroachment
                //    {
                //        EncroachmentTypeID = encroachmentTypes[i],
                //        Permit_Number = newPermit.Permit_Number,
                //        Seq_Num = (short)seq
                //    });
                //}
                //_db.tblPermit_Encroachment.AddRange(encroachments);


                //var refs = new List<tblPermit_References>();
                //for (int i = 0; i < references.Count; i++)
                //{
                //    var seq = i + 1;

                //    refs.Add(new tblPermit_References
                //    {
                //        Permit_Number = newPermit.Permit_Number,
                //        ReferenceTypeID = references[i].ReferenceTypeId,
                //        ReferenceValue = references[i].ReferenceValue
                //    });
                //}
                //_db.tblPermit_References.AddRange(refs);



            }
            catch (Exception exception)
            {
                
                throw exception;
            }

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (PermitExists(newPermit.Permit_Number))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }


            return Ok(newPermit);
        }

        /// <summary>
        /// Gets the encroachment types.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetEncroachmentTypes")]
        public IQueryable<tblEncroachmentType> GetEncroachmentTypes()
        {
            return _db.tblEncroachmentTypes.OrderBy(x => x.EncroachmentTypeName);
        }


        /// <summary>
        /// Gets the occupancy types.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetOccupancyTypes")]
        public IQueryable<tblOccupancyType> GetOccupancyTypes()
        {
            return _db.tblOccupancyTypes.OrderBy(x => x.OccupancyTypeName);
        }


        /// <summary>
        ///     Gets the permit by company identifier.
        /// </summary>
        /// <param name="token">The token.</param>
        /// <param name="companyId">The company identifier.</param>
        /// <param name="statusCode">The status code.</param>
        /// <param name="currentFilter">The current filter.</param>
        /// <param name="filter">The filter.</param>
        /// <param name="search">The search.</param>
        /// <param name="sort">The sort.</param>
        /// <param name="sortDir">The sort dir.</param>
        /// <param name="page">The page.</param>
        /// <param name="pageSize">Size of the page.</param>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [HttpGet]
        [Route("api/permits/GetPermitByCompanyId")]
        [ResponseType(typeof (List<StreetsViewModels.PermitsPage>))]
        public async Task<IHttpActionResult> GetPermitByCompanyId(string token, int companyId, int statusCode = 1,
            string currentFilter = "", string filter = "", string search = "", string sort = "", string sortDir = "",
            int page = 1, int pageSize = 5)
        {
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            var validCompanyId = IsCompanyIdValid(token, companyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
            {
                return Unauthorized();
            }

            List<StreetsViewModels.PermitVm> permits =
                await
                    _db.tblPermits.Where(x => x.CompanyId == companyId)
                        .Include(x => x.tblDecision)
                        .Where(x => x.tblDecision.DecisionID == statusCode)
                        .Select(x => new StreetsViewModels.PermitVm
                        {
                            PermitId = x.Permit_Number,
                            PermitLocation = x.GrantedToText,
                            Purpose = x.Purpose,
                            PermitStatus = x.tblDecision.DecisionName,
                            StartDate = x.EffectiveDate,
                            EndDate = x.ExpirationDate
                        }).ToListAsync();

            if (permits == null)
            {
                return NotFound();
            }

            search = search.Trim().ToUpper();

            // filter
            if (!filter.IsNullOrWhiteSpace() && !search.IsNullOrWhiteSpace())
            {
                switch (filter.ToLower())
                {
                    case "permitid":
                        permits = permits.Where(p => p.PermitId.Contains(search)).ToList();
                        break;
                    case "purpose":
                        permits = permits.Where(p => p.Purpose.Contains(search)).ToList();
                        break;
                    case "permitlocation":

                        try
                        {
                            var pc = permits.Any(p => p.PermitLocation != null && p.PermitLocation.Contains(search));
                            if (pc)
                                permits =
                                    permits.Where(p => p.PermitLocation != null && p.PermitLocation.Contains(search))
                                        .ToList();
                            else
                                return Ok(new List<StreetsViewModels.PermitVm>());
                        }
                        catch (Exception exception)
                        {
                            return Ok(new List<StreetsViewModels.PermitVm>());
                            //permits = new List<StreetsViewModels.PermitVm>();
                        }

                        break;
                    case "startdate":
                        permits = permits.Where(p => p.StartDate.ToString().Contains(search)).ToList();
                        break;
                    case "enddate":
                        permits = permits.Where(p => p.EndDate.ToString().Contains(search)).ToList();
                        break;
                    case "permitstatus":
                        permits = permits.Where(p => p.PermitStatus.Contains(search)).ToList();
                        break;
                    default:
                        permits = permits.Where(p => p.PermitId.Contains(search) || p.Purpose.Contains(search)
                                                     || (p.PermitLocation != null && p.PermitLocation.Contains(search)) ||
                                                     p.StartDate.ToString().Contains(search)
                                                     || p.EndDate.ToString().Contains(search) ||
                                                     p.PermitStatus.Contains(search)).ToList();
                        break;
                }
            }
            else
            {
                permits = permits.Where(p => p.PermitId.Contains(search) || p.Purpose.Contains(search)
                                             || p.PermitLocation.Contains(search) ||
                                             p.StartDate.ToString().Contains(search)
                                             || p.EndDate.ToString().Contains(search) ||
                                             p.PermitStatus.Contains(search)).ToList();
            }

            // sort
            if (sortDir.ToLower() == "desc") // sort desc
            {
                switch (sort.ToLower())
                {
                    case "permitid":
                        permits = permits.OrderByDescending(x => x.PermitId).ToList();
                        break;
                    case "purpose":
                        permits = permits.OrderByDescending(x => x.Purpose).ToList();
                        break;
                    case "permitlocation":
                        permits = permits.OrderByDescending(x => x.PermitLocation).ToList();
                        break;
                    case "startdate":
                        permits = permits.OrderByDescending(x => x.StartDate).ToList();
                        break;
                    case "enddate":
                        permits = permits.OrderByDescending(x => x.EndDate).ToList();
                        break;
                    case "permitstatus":
                        permits = permits.OrderByDescending(x => x.PermitStatus).ToList();
                        break;
                }
            }
            else // sort asc
            {
                switch (sort.ToLower())
                {
                    case "permitid":
                        permits = permits.OrderBy(x => x.PermitId).ToList();
                        break;
                    case "purpose":
                        permits = permits.OrderBy(x => x.Purpose).ToList();
                        break;
                    case "permitlocation":
                        permits = permits.OrderBy(x => x.PermitLocation).ToList();
                        break;
                    case "startdate":
                        permits = permits.OrderBy(x => x.StartDate).ToList();
                        break;
                    case "enddate":
                        permits = permits.OrderBy(x => x.EndDate).ToList();
                        break;
                    case "permitstatus":
                        permits = permits.OrderBy(x => x.PermitStatus).ToList();
                        break;
                }
            }

            // page size must be between 1 and 25
            if (pageSize > 25)
            {
                pageSize = 25;
            }
            else if (pageSize < 1)
            {
                pageSize = 1;
            }

            int totalPermits = permits.Count();
            int totalPages = totalPermits % pageSize;
            totalPages = totalPages > 0 ? (totalPermits/pageSize) + 1 : (totalPermits/pageSize);
            permits = permits.Skip((page - 1)*pageSize).Take(pageSize).ToList();

            var permitsPage = new StreetsViewModels.PermitsPage
            {
                Permits = permits,
                TotalPermits = totalPermits,
                CurrentPage = page,
                TotalPages = totalPages,
                FilteredBy = filter,
                SearchString = search.Trim(),
                PageSize = pageSize,
                SortDirection = sortDir,
                SortedBy = sort
            };

            return Ok(permitsPage);
        }


        /// <summary>
        ///     Gets the permit types.
        /// </summary>
        /// <returns></returns>
        [ResponseType(typeof (IQueryable<StreetsViewModels.PermitTypeVm>))]
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetPermitTypes")]
        public IQueryable<StreetsViewModels.PermitTypeVm> GetPermitTypes()
        {
            var permitTypes =
                _db.tblPermitTypes.OrderBy(x => x.PermitTypeName).Select(x => new StreetsViewModels.PermitTypeVm
                {
                    PermitTypeId = x.PermitTypeID,
                    PermitTypeName = x.PermitTypeName,
                    PermitTypeAbbrev = x.PermitTypeAbbrev
                });

            return permitTypes;
        }


        /// <summary>
        /// Gets the permit PDF.
        /// </summary>
        /// <param name="token">The token.</param>
        /// <param name="permitId">The permit identifier.</param>
        /// <returns></returns>
        /// <remarks>Download a permit as a PDF</remarks>
        /// <response code="400">Bad request</response>
        /// <response code="500">Internal Server Error</response>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        public HttpResponseMessage GetPermitPdf(string token, string permitId)
        {
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

            string userEmailAddress =
                _db.UserTokens.Where(x => x.Token == token).Select(x => x.EmailAddress).FirstOrDefault();

            // get users company ids
            List<int?> companyIds =
                _db.tblContacts.Where(x => x.EMailAddress == userEmailAddress).Select(x => x.CompanyId).ToList();

            tblPermit permit = _db.tblPermits.Include(x => x.tblDecision)
                .FirstOrDefault(x => x.Permit_Number == permitId);

            if (permit != null && permit.CompanyId != null && companyIds.IndexOf(permit.CompanyId) != -1)
            {
                return Request.CreateResponse(HttpStatusCode.OK, permit);
            }
            return Request.CreateResponse(HttpStatusCode.Unauthorized);
        }


        /// <summary>
        ///     Gets the project types.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetProjectTypes")]
        public IQueryable<tblProjectType> GetProjectTypes()
        {
            return _db.tblProjectTypes.OrderBy(x => x.ProjectName);
        }


        /// <summary>
        /// Gets the reference types.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetReferenceTypes")]
        public IQueryable<tblReferenceType> GetReferenceTypes()
        {
            return _db.tblReferenceTypes.OrderBy(x => x.ReferenceTypeName);
        }


        /// <summary>
        ///     Gets the status codes.
        /// </summary>
        /// <returns></returns>
        [ResponseType(typeof (IQueryable<StreetsViewModels.StatusCodesVm>))]
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetStatusCodes")]
        public IQueryable<StreetsViewModels.StatusCodesVm> GetStatusCodes(string token, int companyId)
        {
            return _db.tblDecisions.Select(x => new StreetsViewModels.StatusCodesVm
            {
                StatusCodeId = x.DecisionID,
                StatusCodeName = x.DecisionName
            }).OrderBy(x => x.StatusCodeName);
        }


        /// <summary>
        ///     Gets the status codes.
        /// </summary>
        /// <returns></returns>
        [ResponseType(typeof (IQueryable<StreetsViewModels.StatusSummary>))]
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetStatusSummaryByCompanyId")]
        public IHttpActionResult GetStatusSummaryByCompanyId(string token, int companyId)
        {
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            var validCompanyId = IsCompanyIdValid(token, companyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
            {
                return Unauthorized();
            }

            IQueryable<StreetsViewModels.StatusSummary> permits = _db.tblPermits.Include(x => x.tblDecision)
                .Where(x => x.CompanyId == companyId)
                .GroupBy(x => new {x.DecisionId, x.tblDecision.DecisionName})
                .Select(g => new StreetsViewModels.StatusSummary()
                {
                    StatusCodeId = (int) g.Key.DecisionId,
                    StatusCodeName = g.Key.DecisionName,
                    TotalPermits = g.Count()
                });
            return Ok(permits);
        }


        /// <summary>
        /// Gets the encroachment types.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetStreetClosureViewModelData")]
        public IHttpActionResult GetStreetClosureViewModelData(string token)
        {
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            var vm = new StreetsViewModels.StreetClosureViewModel();

            var company = new CompaniesController();
            vm.UsersCompanyViewModel = company.UsersCompany(token);

            vm.ProjectTypes = GetProjectTypes();
            vm.ReferenceTypes = GetReferenceTypes();
            vm.EncroachmentTypes = GetEncroachmentTypes();
            vm.PermitTypeVms = GetPermitTypes();
            vm.UtilityOwners = GetUtilityOwners();
            vm.OccupancyTypes = GetOccupancyTypes();

            return Ok(vm);
        }


        /// <summary>
        /// Gets the utility owners.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetUtilityOwners")]
        public IQueryable<tblOwner> GetUtilityOwners()
        {
            return _db.tblOwners.OrderBy(x => x.Name);
        }


        private bool PermitExists(string id)
        {
            return _db.tblPermits.Count(e => e.Permit_Number == id) > 0;
        }


        private bool IsCompanyIdValid(string token, int companyId)
        {
            string contactEmailAddress =
                _db.UserTokens.Where(x => x.Token == token).Select(x => x.EmailAddress).FirstOrDefault();

            // get users company ids
            List<int?> companyIds =
                _db.tblContacts.Where(x => x.EMailAddress == contactEmailAddress).Select(x => x.CompanyId).ToList();

            bool validCompanyId = companyIds.IndexOf(companyId) == -1;
            return validCompanyId;
        }


        private string GetNewPermitNumber()
        {
            var lastPermitNumber =
                _db.tblPermits.OrderByDescending(x => x.Permit_Number).Select(x => x.Permit_Number).FirstOrDefault();
            Char delimiter = '-';
            var substrings = lastPermitNumber.Split(delimiter);
            var num = Convert.ToInt32(substrings[1]);
            return string.Format("{0}-{1}", substrings[0], ++num);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }


        //public async Task<IHttpActionResult> GetPermitByContactId(int contactId) 
        //{
        //    var tblPermit = await db.tblPermits.Where(x => x.ContactId == contactId).ToListAsync();

        //    if (tblPermit == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(tblPermit);
        //}


        //public async Task<IHttpActionResult> GetPermitByCompanyIdAndStatusId(int companyId, int statusId)
        //{
        //    var tblPermit = await db.tblPermits.Where(x => x.CompanyId == companyId && x.DecisionId == statusId).ToListAsync();

        //    if (tblPermit == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(tblPermit);
        //}

        ///// <summary>
        ///// Gets a maximum of 25 permits.
        ///// </summary>
        ///// <returns>Permits</returns>
        //[Authorize(Roles = "Streets")]
        //public IQueryable<tblPermit> GetPermits()
        //{           
        //    var permits = db.tblPermits.Take(25);
        //    return permits;
        //}

        ///// <summary>
        ///// Gets the permit.
        ///// </summary>
        ///// <param name="id">The identifier.</param>
        ///// <returns></returns>
        //[ResponseType(typeof(tblPermit))]
        //public async Task<IHttpActionResult> GetPermitByPermitId(string id)
        //{
        //    var tblPermit = await db.tblPermits.Where(x => x.Permit_Number == id).ToListAsync();

        //    if (tblPermit == null)
        //    {
        //        return NotFound();
        //    }

        //    return Ok(tblPermit);
        //}


        ///// <summary>
        ///// Posts the permit.
        ///// </summary>
        ///// <param name="tblPermit">The table permit.</param>
        ///// <returns></returns>
        ////[Route("api/Permits/CreatePermit")]
        //[ResponseType(typeof(tblPermit))]
        //public async Task<IHttpActionResult> CreatePermit(tblPermit tblPermit)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    db.tblPermits.Add(tblPermit);

        //    try
        //    {
        //        await db.SaveChangesAsync();
        //    }
        //    catch (DbUpdateException)
        //    {
        //        if (PermitExists(tblPermit.Permit_Number))
        //        {
        //            return Conflict();
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return CreatedAtRoute("DefaultApi", new { id = tblPermit.Permit_Number }, tblPermit);
        //}

        ///// <summary>
        ///// Edits the permit permit application.
        ///// </summary>
        ///// <param name="id">The identifier.</param>
        ///// <param name="tblPermit">The table permit.</param>
        ///// <returns></returns>
        //[ResponseType(typeof(void))]
        ////[Route("api/Permits/UpdatePermit")]
        //public async Task<IHttpActionResult> UpdatePermit(string id, tblPermit tblPermit)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    if (id != tblPermit.Permit_Number)
        //    {
        //        return BadRequest();
        //    }

        //    db.Entry(tblPermit).State = EntityState.Modified;

        //    try
        //    {
        //        await db.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!PermitExists(id))
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

        ///// <summary>
        ///// Deletes the permit application.
        ///// </summary>
        ///// <param name="permitId">The identifier.</param>
        ///// <returns></returns>
        ////[Route("api/Permits/CancelPermit")]
        //[ResponseType(typeof(tblPermit))]
        //public async Task<IHttpActionResult> CancelPermit(string permitId, string userId, string token)
        //{

        //    //bool validUser = ValidateUser(userId, token); 

        //    var tblPermit = await db.tblPermits.Where(x => x.Permit_Number == permitId).ToListAsync();

        //    //tblPermit tblPermit = await db.tblPermits.FindAsync(permitId);
        //    if (tblPermit == null || tblPermit.Count != 1)
        //    {
        //        return NotFound();
        //    }
        //    else
        //    {
        //        tblPermit foundPermit = (tblPermit)tblPermit[0];//recast permit that matches our permitID
        //        foundPermit.DecisionId = 6;
        //        foundPermit.Comments += "\r\nCancelled by user";
        //        db.Entry(foundPermit).State = EntityState.Modified;
        //        await db.SaveChangesAsync();
        //    }

        //    return Ok(tblPermit);
        //}
    }
}