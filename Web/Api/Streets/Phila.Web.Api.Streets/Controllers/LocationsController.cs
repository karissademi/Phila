using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Description;
using Phila.Data.EntityModels.Streets;
using Phila.Web.Api.Streets.Models;

namespace Phila.Web.Api.Streets.Controllers
{
    public class LocationsController : ApiController
    {
        private readonly SCBPPSEntities _db = new SCBPPSEntities();

        /// <summary>
        ///     Gets the permit streets.
        /// </summary>
        /// <param name="onStreet">The search term.</param>
        /// <returns></returns>
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/locations/GetOnStreets")]
        [ResponseType(typeof(List<StreetsViewModels.Street>))]
        public IHttpActionResult GetOnStreets(string onStreet)
        {

             var numSts = new[]
            {
                "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"
            };

            var firstThreeChar = new string(onStreet.ToLower().Take(3).ToArray());

            var sn = numSts.Any(x => x.StartsWith(firstThreeChar));
            
            var streetNumberString = !sn ?  new String(onStreet.TakeWhile(Char.IsDigit).ToArray()) : "";
            
            var streetName = onStreet.TrimStart(new[] {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'});
           

            streetName = streetName.Trim(new[] {' '});
            

            // 1234 Market St
            if (streetNumberString.Length > 0)
            {
                var streetNumber = Convert.ToInt32(streetNumberString);
                var streets =
                    _db.tblStreets.Where(
                            x => (x.StreetName.StartsWith(streetName) || x.StreetNameShort.StartsWith(streetName) || x.StreetNameShort.StartsWith(onStreet)
                                || x.StreetNameShort.StartsWith(streetName)) && x.L_F_ADD <= streetNumber && x.R_T_ADD >= streetNumber)
                            .GroupBy(x => new {StreetName = x.StreetName})
                            .Select(x => new StreetsViewModels.Street
                            {
                                StreetName = streetNumber + " " + x.Key.StreetName
                            })
                            .OrderBy(x => x.StreetName)
                            .Take(10)
                            .ToList();

                return Ok(streets);
            }
            else // Market St
            {
                var streets =
                    _db.tblStreets.Where(
                            x => x.StreetName.StartsWith(streetName) || x.StreetNameShort.StartsWith(streetName) || x.StreetNameShort.StartsWith(onStreet) || x.StreetNameShort.StartsWith(streetName))
                            .GroupBy(x => new {StreetName = x.StreetName})
                            .Select(x => new
                            {
                                x.Key.StreetName
                            })
                            .OrderBy(x => x.StreetName)
                            .Take(10)
                            .ToList();

                return Ok(streets);
            }
        }

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/locations/GetFromStreets")]
        public async Task<IHttpActionResult> GetFromStreets(string onStreet)
        {
            var onStreetCode = GetStreetCode(onStreet);
            if (onStreetCode.StreetCode == null)
                return NotFound();

            return Ok(_db.Get_CrossStreetsFromStCode_new(onStreetCode.StreetCode));
        }


        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/locations/GetToStreets")]
        public async Task<IHttpActionResult> GetToStreets(string onStreet, string fromStreet, int fromNodeNumber,
            bool trimLeadingNumbers = true)
        {
            var onStreetDetails = GetStreetCode(onStreet);


            var fromStreetDetails = GetStreetCode(fromStreet, trimLeadingNumbers);


            if (onStreetDetails.StreetCode == null || fromStreetDetails.StreetCode == null)
                return Ok("No results");

            var streetSegments = _db.Get_CrossStreetsFromStCode_new(onStreetDetails.StreetCode).ToList();

            if (streetSegments.All(x => x.St_Code != fromStreetDetails.StreetCode))
                return BadRequest("The 'from street' does not cross the 'on street'.");
            try
            {
                var startingSegment = streetSegments.FirstOrDefault(x => x.NodeOrder == fromNodeNumber);

                if (startingSegment == null)
                    return Ok("No additional segments");

                var result = streetSegments.Where(x => x.NodeOrder > startingSegment.NodeOrder);
                return Ok(result);
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }
        }


        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/locations/IsLocationAHighTrafficArea")]
        public async Task<IHttpActionResult> IsLocationAHighTrafficArea(string location, bool trimLeadingNumbers = true)
        {
            var locationDetals = GetStreetCode(location, trimLeadingNumbers);

            if (locationDetals.SegmentId == null)
                return Ok();

            var result = _db.sp_Get_HightrafficArea(locationDetals.SegmentId);

            return Ok(result);
        }

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/locations/GetFromNodeIds")]
        public async Task<IHttpActionResult> GetFromNodeIds(int? stCode, int? fromNodeOrder, int? toNodeOrder)
        {
            var result = _db.get_OnStreetElementsBetweenOrderedPair(stCode, fromNodeOrder, toNodeOrder);

            return Ok(result);
        }


        private StreetsViewModels.LocationDetails GetStreetCode(string location, bool trimLeadingNumbers = true)
        {
            if (trimLeadingNumbers)
                location = location.TrimStart(new[] {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'});

            location = location.Trim(new[] {' '});
            var result =
                _db.tblStreets.Where(x => x.StreetName == location || x.STNAME == location)
                    .Select(x => new StreetsViewModels.LocationDetails {StreetCode = x.ST_CODE, SegmentId = x.SEG_ID})
                    .FirstOrDefault();

            return result;
        }
        

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}