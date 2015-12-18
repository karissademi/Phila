using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
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
        /// Creates the permit.
        /// </summary>
        /// <param name="permit">The permit.</param>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/CreatePermit")]
        [HttpPost]
        public async Task<IHttpActionResult> CreatePermit([FromBody] StreetsViewModels.PostedPermit permit)
        {
            //if (encroachmentTypes == null) throw new ArgumentNullException("encroachmentTypes");

            var st = new SecurityToken();
            bool auth = st.IsTokenValid(permit.Token);

            if (!auth)
                return Unauthorized();

            bool validCompanyId = IsCompanyIdValid(permit.Token, (int) permit.CompanyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
                return Unauthorized();


            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            tblCompany company = _db.tblCompanies.FirstOrDefault(x => x.CompanyId == permit.CompanyId);
            if (company == null)
                return Unauthorized();

            UserToken user = _db.UserTokens.FirstOrDefault(x => x.Token == permit.Token);
            if (user == null)
                return Unauthorized();

            tblContact userInfo = _db.tblContacts.FirstOrDefault(x => x.EMailAddress == user.EmailAddress);

            if (userInfo == null)
                return Unauthorized();

            var newPermit = new tblPermit
            {
                ApplicationDate = DateTime.Now,
                EntryDate = DateTime.Now,
                OwnerId = permit.UtilityOwnerId,
                CompanyId = permit.CompanyId,
                Comments = permit.Comments,
                EffectiveDate = permit.EffectiveDate,
                ExpirationDate = permit.ExpirationDate,
                Permit_Number = GetNewPermitNumber(),
                Purpose = permit.Purpose,
                DecisionId = permit.IsDraft == false ? (short) 3 : (short) 8,
                ProjectType = permit.ProjectTypes,
                Rec_DateTime = DateTime.Now,
                PermitTypeId = permit.PermitTypeId,
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
                ContactId = userInfo.ContactId,
                Rec_UserId = "StreetClosureWebUser"
            };


            try
            {
                _db.tblPermits.Add(newPermit);

                var encroachments = new List<tblPermit_Encroachment>();
                for (int i = 0; i < permit.EncroachmentTypes.Count; i++)
                {
                    int seq = i + 1;
                    encroachments.Add(new tblPermit_Encroachment
                    {
                        EncroachmentTypeID = permit.EncroachmentTypes[i],
                        Permit_Number = newPermit.Permit_Number,
                        Seq_Num = (short) seq
                    });
                }
                _db.tblPermit_Encroachment.AddRange(encroachments);


                var refs = new List<tblPermit_References>();
                for (int i = 0; i < permit.References.Count; i++)
                {
                    int seq = i + 1;

                    refs.Add(new tblPermit_References
                    {
                        Permit_Number = newPermit.Permit_Number,
                        Seq_Num = (short) seq,
                        ReferenceTypeID = permit.References[i].ReferenceTypeId,
                        ReferenceValue = permit.References[i].ReferenceValue
                    });
                }
                _db.tblPermit_References.AddRange(refs);

                var locs = new List<tblPermit_Locations>();
                var gisLocs = new List<tblPermit_Location_GIS>();
                foreach (StreetsViewModels.PostedLocation permitLocation in permit.Locations)
                {
                    //ToDo: check if location is valid

                    var lc = new LocationsController();
                    StreetsViewModels.LocationDetails stCode = lc.GetStreetCode(permitLocation.OnStreetName, true);


                    if (stCode.StreetCode != null)
                    {
                        locs.Add(new tblPermit_Locations
                        {
                            Permit_Number = newPermit.Permit_Number,
                            Seq_Num = (short) permitLocation.SequenceNumber,
                            OccupancyTypeID = (short) permitLocation.OccupancyTypeId,
                            OnSTCODE = (int) stCode.StreetCode,
                            sOnActual = permitLocation.OnStreetName,
                            FromSTCODE = permitLocation.FromStreetCode,
                            sFromActual = permitLocation.FromStreetName,
                            ToSTCODE = permitLocation.ToStreetCode,
                            sToActual = permitLocation.ToStreetName,
                            LocationType = permitLocation.LocationType
                            
                        });

                        switch (permitLocation.LocationType.ToLower())
                        {
                            case "address":
                                //ToDo... 

                                break;
                            case "intersection":

                                ObjectResult<get_OnStreetElementsBetweenOrderedPair_Result> intResult =
                                    _db.get_OnStreetElementsBetweenOrderedPair(stCode.StreetCode,
                                        permitLocation.FromStreetNode, permitLocation.FromStreetNode);

                                gisLocs.AddRange(intResult.Select(x => new tblPermit_Location_GIS
                                {
                                    Permit_Number = newPermit.Permit_Number,
                                    Seq_Num = (short) permitLocation.SequenceNumber,
                                    DateCreated = DateTime.Now,
                                    Element_Id = (int) x.ElementId,
                                    lElementTypeID = x.ElementTypeId
                                }));

                                break;
                            case "street segment":

                                ObjectResult<get_OnStreetElementsBetweenOrderedPair_Result> spResult =
                                    _db.get_OnStreetElementsBetweenOrderedPair(stCode.StreetCode,
                                        permitLocation.FromStreetNode, permitLocation.ToStreetNode);

                                gisLocs.AddRange(spResult.Select(x => new tblPermit_Location_GIS
                                {
                                    Permit_Number = newPermit.Permit_Number,
                                    Seq_Num = (short) permitLocation.SequenceNumber,
                                    DateCreated = DateTime.Now,
                                    Element_Id = (int) x.ElementId,
                                    lElementTypeID = x.ElementTypeId
                                }));

                                break;
                        }
                    }
                }

                //insert into tblPermit_Locations
                _db.tblPermit_Locations.AddRange(locs);

                //insert into tblPermit_LocationsGIS
                _db.tblPermit_Location_GIS.AddRange(gisLocs);
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
                throw;
            }


            return Ok(newPermit);
        }


        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [ResponseType(typeof(void))]
        [Route("api/Permits/CancelPermit")]
        public async Task<IHttpActionResult> CancelPermit(string token, string permitNumber)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
                return Unauthorized();

            var permit = _db.tblPermits.FirstOrDefault(x => x.Permit_Number == permitNumber);

            bool validCompanyId = permit != null && IsCompanyIdValid(token, (int)permit.CompanyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
                return Unauthorized();

            tblCompany company = _db.tblCompanies.FirstOrDefault(x => x.CompanyId == permit.CompanyId);
            if (company == null)
                return Unauthorized();

            UserToken user = _db.UserTokens.FirstOrDefault(x => x.Token == token);
            if (user == null)
                return Unauthorized();

            tblContact userInfo = _db.tblContacts.FirstOrDefault(x => x.EMailAddress == user.EmailAddress);

            if (userInfo == null)
                return Unauthorized();

            tblPermit modifiedPermit = _db.tblPermits.FirstOrDefault(x => x.Permit_Number == permitNumber);

            if (modifiedPermit == null)
                return BadRequest();

            if (modifiedPermit.DecisionId != 3 && modifiedPermit.DecisionId != 4 && modifiedPermit.DecisionId != 8)
                return Unauthorized();

            modifiedPermit.DecisionId = (short)9;

            _db.Entry(modifiedPermit).State = EntityState.Modified;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermitExists(permitNumber))
                {
                    return NotFound();
                }
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        /// <summary>
        ///     Gets the encroachment types.
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
        ///     Gets the occupancy types.
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

            bool validCompanyId = IsCompanyIdValid(token, companyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
            {
                return Unauthorized();
            }

            List<StreetsViewModels.PostedPermit> permits =
                await
                    _db.tblPermits.Where(x => x.CompanyId == companyId)
                        .Include(x => x.tblDecision)
                        .Include(x => x.tblPermit_Encroachment)
                        .Include(x => x.tblPermit_Locations)
                        .Where(x => x.tblDecision.DecisionID == statusCode)
                        .Select(x => new StreetsViewModels.PostedPermit
                        {
                            PermitNumber = x.Permit_Number,
                            PermitStatus = x.tblDecision.DecisionName,
                            CompanyName = x.Company_Name,
                            CompanyId = x.CompanyId,
                            EffectiveDate = x.EffectiveDate,
                            ExpirationDate = x.ExpirationDate,
                            Purpose = x.Purpose,
                            PermitTypeId = x.PermitTypeId,
                            Comments = x.Comments,
                            ProjectTypes = x.ProjectType,
                            EncroachmentTypes = x.tblPermit_Encroachment.Select(j => j.EncroachmentTypeID).ToList(),
                            Locations = x.tblPermit_Locations.Select(j => new StreetsViewModels.PostedLocation
                            {
                                OccupancyTypeId = (short) j.OccupancyTypeID,
                                OnStreetCode = j.OnSTCODE,
                                OnStreetName = j.sOnActual,
                                FromStreetCode = j.FromSTCODE,
                                FromStreetName = j.sFromActual,
                                ToStreetCode = j.ToSTCODE,
                                ToStreetName = j.sToActual,
                                LocationType = j.LocationType
                            }).ToList(),
                            References = x.tblPermit_References.Select(j => new StreetsViewModels.PostedReference
                            {
                                ReferenceTypeId = j.ReferenceTypeID,
                                ReferenceValue = j.ReferenceValue
                            }).ToList()
                        }).ToListAsync();

            if (permits == null)
            {
                return NotFound();
            }

            search = search.Trim().ToUpper();

            //// filter
            //if (!filter.IsNullOrWhiteSpace() && !search.IsNullOrWhiteSpace())
            //{
            //    switch (filter.ToLower())
            //    {
            //        case "permitid":
            //            permits = permits.Where(p => p.PermitNumber.Contains(search)).ToList();
            //            break;
            //        case "purpose":
            //            permits = permits.Where(p => p.Purpose.Contains(search)).ToList();
            //            break;
            //        case "permitlocation":

            //            try
            //            {
            //                bool pc = permits.Any(p => p.Locations != null && p.Locations.Contains(search));
            //                if (pc)
            //                    permits =
            //                        permits.Where(p => p.PermitLocation != null && p.PermitLocation.Contains(search))
            //                            .ToList();
            //                else
            //                    return Ok(new List<StreetsViewModels.PermitVm>());
            //            }
            //            catch (Exception exception)
            //            {
            //                return Ok(new List<StreetsViewModels.PermitVm>());
            //                //permits = new List<StreetsViewModels.PermitVm>();
            //            }

            //            break;
            //        case "startdate":
            //            permits = permits.Where(p => p.StartDate.ToString().Contains(search)).ToList();
            //            break;
            //        case "enddate":
            //            permits = permits.Where(p => p.EndDate.ToString().Contains(search)).ToList();
            //            break;
            //        case "permitstatus":
            //            permits = permits.Where(p => p.PermitStatus.Contains(search)).ToList();
            //            break;
            //        default:
            //            permits = permits.Where(p => p.PermitId.Contains(search) || p.Purpose.Contains(search)
            //                                         || (p.PermitLocation != null && p.PermitLocation.Contains(search)) ||
            //                                         p.StartDate.ToString().Contains(search)
            //                                         || p.EndDate.ToString().Contains(search) ||
            //                                         p.PermitStatus.Contains(search)).ToList();
            //            break;
            //    }
            //}
            //else
            //{
            permits = permits.Where(p => p.PermitNumber.Contains(search) || p.Purpose.Contains(search)
                //|| p.PermitLocation.Contains(search) 
                                         || p.EffectiveDate.ToString().Contains(search)
                                         || p.ExpirationDate.ToString().Contains(search)
                                         || p.PermitStatus.Contains(search)).ToList();
            //}

            // sort
            if (sortDir.ToLower() == "desc") // sort desc
            {
                switch (sort.ToLower())
                {
                    case "permitid":
                        permits = permits.OrderByDescending(x => x.PermitNumber).ToList();
                        break;
                    case "purpose":
                        permits = permits.OrderByDescending(x => x.Purpose).ToList();
                        break;
                        //case "permitlocation":
                        //    permits = permits.OrderByDescending(x => x.PermitLocation).ToList();
                        //    break;
                    case "startdate":
                        permits = permits.OrderByDescending(x => x.EffectiveDate).ToList();
                        break;
                    case "enddate":
                        permits = permits.OrderByDescending(x => x.ExpirationDate).ToList();
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
                        permits = permits.OrderBy(x => x.PermitNumber).ToList();
                        break;
                    case "purpose":
                        permits = permits.OrderBy(x => x.Purpose).ToList();
                        break;
                        //case "permitlocation":
                        //    permits = permits.OrderBy(x => x.PermitLocation).ToList();
                        //    break;
                    case "startdate":
                        permits = permits.OrderBy(x => x.EffectiveDate).ToList();
                        break;
                    case "enddate":
                        permits = permits.OrderBy(x => x.ExpirationDate).ToList();
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
            int totalPages = totalPermits%pageSize;
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


        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [HttpGet]
        [Route("api/permits/GetPermitByPermitId")]
        [ResponseType(typeof (StreetsViewModels.PermitsPage))]
        public async Task<IHttpActionResult> GetPermitByPermitId(string token, string permitNumber)
        {
            var st = new SecurityToken();
            bool auth = st.IsTokenValid(token);

            if (!auth)
            {
                return Unauthorized();
            }

            int? companyId =
                _db.tblPermits.Where(x => x.Permit_Number == permitNumber).Select(x => x.CompanyId).FirstOrDefault();

            bool validCompanyId = companyId != null && IsCompanyIdValid(token, (int) companyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
            {
                return Unauthorized();
            }

            StreetsViewModels.PostedPermit permit =
                await
                    _db.tblPermits.Where(x => x.CompanyId == companyId)
                        .Include(x => x.tblDecision)
                        .Include(x => x.tblPermit_Encroachment)
                        .Include(x => x.tblPermit_Locations)
                        .Select(x => new StreetsViewModels.PostedPermit
                        {
                            PermitNumber = x.Permit_Number,
                            PermitStatus = x.tblDecision.DecisionName,
                            CompanyName = x.Company_Name,
                            CompanyId = x.CompanyId,
                            EffectiveDate = x.EffectiveDate,
                            ExpirationDate = x.ExpirationDate,
                            Purpose = x.Purpose,
                            PermitTypeId = x.PermitTypeId,
                            Comments = x.Comments,
                            ProjectTypes = x.ProjectType,
                            EncroachmentTypes = x.tblPermit_Encroachment.Select(j => j.EncroachmentTypeID).ToList(),
                            Locations = x.tblPermit_Locations.Select(j => new StreetsViewModels.PostedLocation
                            {
                                OccupancyTypeId = (short) j.OccupancyTypeID,
                                OnStreetCode = j.OnSTCODE,
                                OnStreetName = j.sOnActual,
                                FromStreetCode = j.FromSTCODE,
                                FromStreetName = j.sFromActual,
                                ToStreetCode = j.ToSTCODE,
                                ToStreetName = j.sToActual,
                                LocationType = j.LocationType
                            }).ToList(),
                            References = x.tblPermit_References.Select(j => new StreetsViewModels.PostedReference
                            {
                                ReferenceTypeId = j.ReferenceTypeID,
                                ReferenceValue = j.ReferenceValue
                            }).ToList()
                        }).FirstOrDefaultAsync();

            return Ok(permit);
        }


        //private StreetsViewModels.PostedLocation tblLocationToPostedLocation(tblPermit_Locations location)
        //{
        //    return new StreetsViewModels.PostedLocation
        //    {

        //    };            
        //}


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
            IQueryable<StreetsViewModels.PermitTypeVm> permitTypes =
                _db.tblPermitTypes.Where(x => x.PermitTypeID != 7)
                    .OrderBy(x => x.PermitTypeName)
                    .Select(x => new StreetsViewModels.PermitTypeVm
                    {
                        PermitTypeId = x.PermitTypeID,
                        PermitTypeName = x.PermitTypeName,
                        PermitTypeAbbrev = x.PermitTypeAbbrev
                    });

            return permitTypes;
        }


        /// <summary>
        ///     Gets the permit PDF.
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
        ///     Gets the reference types.
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

            bool validCompanyId = IsCompanyIdValid(token, companyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
            {
                return Unauthorized();
            }

            IQueryable<StreetsViewModels.StatusSummary> permits = _db.tblPermits.Include(x => x.tblDecision)
                .Where(x => x.CompanyId == companyId)
                .GroupBy(x => new {x.DecisionId, x.tblDecision.DecisionName})
                .Select(g => new StreetsViewModels.StatusSummary
                {
                    StatusCodeId = (int) g.Key.DecisionId,
                    StatusCodeName = g.Key.DecisionName,
                    TotalPermits = g.Count()
                });
            return Ok(permits);
        }


        /// <summary>
        ///     Gets the encroachment types.
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
        ///     Gets the utility owners.
        /// </summary>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/permits/GetUtilityOwners")]
        public IQueryable<tblOwner> GetUtilityOwners()
        {
            return _db.tblOwners.OrderBy(x => x.Name);
        }

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [ResponseType(typeof (void))]
        [Route("api/Permits/UpdatePermit")]
        public async Task<IHttpActionResult> UpdatePermit(string permitNumber, StreetsViewModels.PostedPermit permit)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (permitNumber != permit.PermitNumber)
            {
                return BadRequest();
            }

            var st = new SecurityToken();
            bool auth = st.IsTokenValid(permit.Token);

            if (!auth)
                return Unauthorized();

            bool validCompanyId = IsCompanyIdValid(permit.Token, (int) permit.CompanyId);

            // is the user auth to get permits of companyId?
            if (validCompanyId)
                return Unauthorized();;

            tblCompany company = _db.tblCompanies.FirstOrDefault(x => x.CompanyId == permit.CompanyId);
            if (company == null)
                return Unauthorized();

            UserToken user = _db.UserTokens.FirstOrDefault(x => x.Token == permit.Token);
            if (user == null)
                return Unauthorized();

            tblContact userInfo = _db.tblContacts.FirstOrDefault(x => x.EMailAddress == user.EmailAddress);

            if (userInfo == null)
                return Unauthorized();

            tblPermit modifiedPermit = _db.tblPermits.FirstOrDefault(x => x.Permit_Number == permitNumber);

            if (modifiedPermit == null)
                return BadRequest();

            modifiedPermit.ApplicationDate = DateTime.Now;
            modifiedPermit.EntryDate = DateTime.Now;
            modifiedPermit.OwnerId = permit.UtilityOwnerId;
            modifiedPermit.CompanyId = permit.CompanyId;
            modifiedPermit.Comments = permit.Comments;
            modifiedPermit.EffectiveDate = permit.EffectiveDate;
            modifiedPermit.ExpirationDate = permit.ExpirationDate;
            modifiedPermit.Purpose = permit.Purpose;
            modifiedPermit.DecisionId = permit.IsDraft == false ? (short) 3 : (short) 8;
            modifiedPermit.ProjectType = permit.ProjectTypes;
            modifiedPermit.Rec_DateTime = DateTime.Now;
            modifiedPermit.PermitTypeId = permit.PermitTypeId;
            modifiedPermit.Company_Name = company.Name;
            modifiedPermit.Address1 = company.Address1;
            modifiedPermit.Address2 = company.Address2;
            modifiedPermit.City = company.City;
            modifiedPermit.State = company.State;
            modifiedPermit.PostalCode = company.PostalCode;
            modifiedPermit.Phone = company.Phone;
            modifiedPermit.Fax = company.Fax;
            modifiedPermit.Contact_First_Name = userInfo.FirstName;
            modifiedPermit.Contact_Mid_Name = userInfo.MiddleName;
            modifiedPermit.Contact_Last_Name = userInfo.LastName;
            modifiedPermit.ContactId = userInfo.ContactId;
            modifiedPermit.Rec_UserId = "StreetClosureWebUser";

            _db.Entry(modifiedPermit).State = EntityState.Modified;

            try
            {

                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermitExists(permitNumber))
                {
                    return NotFound();
                }
                throw;
            }


            // delete records from tblPermit_Encroachments
            var encroachs = _db.tblPermit_Encroachment.Where(x => x.Permit_Number == permitNumber).ToList();
            foreach (var encroachment in encroachs)
                _db.tblPermit_Encroachment.Remove(encroachment);

            // delete records from tblPermit_References
            var references = _db.tblPermit_References.Where(x => x.Permit_Number == permitNumber).ToList();
            foreach (var reference in references)
                _db.tblPermit_References.Remove(reference);

            // delete records from tblPermit_Locations
            var locations = _db.tblPermit_Locations.Where(x => x.Permit_Number == permitNumber).ToList();
            foreach (var location in locations)
                _db.tblPermit_Locations.Remove(location);

            // delete records from tblPermit_Locations_GIS
            var locationsGis = _db.tblPermit_Location_GIS.Where(x => x.Permit_Number == permitNumber).ToList();
            foreach (var location in locationsGis)
                _db.tblPermit_Location_GIS.Remove(location);


            try
            {

                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermitExists(permitNumber))
                {
                    return NotFound();
                }
                throw;
            }

            var encroachments = new List<tblPermit_Encroachment>();
            for (int i = 0; i < permit.EncroachmentTypes.Count; i++)
            {
                int seq = i + 1;
                encroachments.Add(new tblPermit_Encroachment
                {
                    EncroachmentTypeID = permit.EncroachmentTypes[i],
                    Permit_Number = modifiedPermit.Permit_Number,
                    Seq_Num = (short)seq
                });
            }
            _db.tblPermit_Encroachment.AddRange(encroachments);


            var refs = new List<tblPermit_References>();
            for (int i = 0; i < permit.References.Count; i++)
            {
                int seq = i + 1;

                refs.Add(new tblPermit_References
                {
                    Permit_Number = modifiedPermit.Permit_Number,
                    Seq_Num = (short)seq,
                    ReferenceTypeID = permit.References[i].ReferenceTypeId,
                    ReferenceValue = permit.References[i].ReferenceValue
                });
            }
            _db.tblPermit_References.AddRange(refs);


            var locs = new List<tblPermit_Locations>();
            var gisLocs = new List<tblPermit_Location_GIS>();
            foreach (StreetsViewModels.PostedLocation permitLocation in permit.Locations)
            {
                //ToDo: check if location is valid

                var lc = new LocationsController();
                StreetsViewModels.LocationDetails stCode = lc.GetStreetCode(permitLocation.OnStreetName, true);


                if (stCode.StreetCode != null)
                {
                    locs.Add(new tblPermit_Locations
                    {
                        Permit_Number = modifiedPermit.Permit_Number,
                        Seq_Num = (short)permitLocation.SequenceNumber,
                        OccupancyTypeID = (short)permitLocation.OccupancyTypeId,
                        OnSTCODE = (int)stCode.StreetCode,
                        sOnActual = permitLocation.OnStreetName,
                        FromSTCODE = permitLocation.FromStreetCode,
                        sFromActual = permitLocation.FromStreetName,
                        ToSTCODE = permitLocation.ToStreetCode,
                        sToActual = permitLocation.ToStreetName,
                        LocationType = permitLocation.LocationType
                    });

                    switch (permitLocation.LocationType.ToLower())
                    {
                        case "address":

                            break;
                        case "intersection":

                            ObjectResult<get_OnStreetElementsBetweenOrderedPair_Result> intResult =
                                _db.get_OnStreetElementsBetweenOrderedPair(stCode.StreetCode,
                                    permitLocation.FromStreetNode, permitLocation.FromStreetNode);

                            gisLocs.AddRange(intResult.Select(x => new tblPermit_Location_GIS
                            {
                                Permit_Number = modifiedPermit.Permit_Number,
                                Seq_Num = (short)permitLocation.SequenceNumber,
                                DateCreated = DateTime.Now,
                                Element_Id = (int)x.ElementId,
                                lElementTypeID = x.ElementTypeId
                            }));

                            break;
                        case "street segment":

                            ObjectResult<get_OnStreetElementsBetweenOrderedPair_Result> spResult =
                                _db.get_OnStreetElementsBetweenOrderedPair(stCode.StreetCode,
                                    permitLocation.FromStreetNode, permitLocation.ToStreetNode);

                            gisLocs.AddRange(spResult.Select(x => new tblPermit_Location_GIS
                            {
                                Permit_Number = modifiedPermit.Permit_Number,
                                Seq_Num = (short)permitLocation.SequenceNumber,
                                DateCreated = DateTime.Now,
                                Element_Id = (int)x.ElementId,
                                lElementTypeID = x.ElementTypeId
                            }));

                            break;
                    }
                }
            }

            //insert into tblPermit_Locations
            _db.tblPermit_Locations.AddRange(locs);

            //insert into tblPermit_LocationsGIS
            _db.tblPermit_Location_GIS.AddRange(gisLocs);


            try
            {

                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PermitExists(permitNumber))
                {
                    return NotFound();
                }
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
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
            string lastPermitNumber =
                _db.tblPermits.OrderByDescending(x => x.Permit_Number).Select(x => x.Permit_Number).FirstOrDefault();
            Char delimiter = '-';
            string[] substrings = lastPermitNumber.Split(delimiter);
            int num = Convert.ToInt32(substrings[1]);
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