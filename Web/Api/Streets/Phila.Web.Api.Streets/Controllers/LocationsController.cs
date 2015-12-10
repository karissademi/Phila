using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Objects;
using System.Linq;
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
        [ResponseType(typeof (List<StreetsViewModels.Street>))]
        public IHttpActionResult GetOnStreets(string onStreet)
        {
            var numSts = new[]
            {
                "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"
            };

            var firstThreeChar = new string(onStreet.ToLower().Take(3).ToArray());

            bool sn = numSts.Any(x => x.StartsWith(firstThreeChar));

            string streetNumberString = !sn ? new String(onStreet.TakeWhile(Char.IsDigit).ToArray()) : "";

            string streetName = onStreet.TrimStart(new[] {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'});


            streetName = streetName.Trim(new[] {' '});


            // 1234 Market St
            if (streetNumberString.Length > 0)
            {
                int streetNumber = Convert.ToInt32(streetNumberString);
                List<StreetsViewModels.Street> streets =
                    _db.tblStreets.Where(
                        x =>
                            (x.StreetName.StartsWith(streetName) || x.StreetNameShort.StartsWith(streetName) ||
                             x.StreetNameShort.StartsWith(onStreet)
                             || x.StreetNameShort.StartsWith(streetName)) && x.L_F_ADD <= streetNumber &&
                            x.R_T_ADD >= streetNumber)
                        .GroupBy(x => new {x.StreetName})
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
                        x =>
                            x.StreetName.StartsWith(streetName) || x.StreetNameShort.StartsWith(streetName) ||
                            x.StreetNameShort.StartsWith(onStreet) || x.StreetNameShort.StartsWith(streetName))
                        .GroupBy(x => new {x.StreetName})
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
            StreetsViewModels.LocationDetails onStreetCode = GetStreetCode(onStreet);
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
            StreetsViewModels.LocationDetails onStreetDetails = GetStreetCode(onStreet);


            StreetsViewModels.LocationDetails fromStreetDetails = GetStreetCode(fromStreet, trimLeadingNumbers);


            if (onStreetDetails.StreetCode == null || fromStreetDetails.StreetCode == null)
                return Ok("No results");

            List<Get_CrossStreetsFromStCode_new_Result> streetSegments =
                _db.Get_CrossStreetsFromStCode_new(onStreetDetails.StreetCode).ToList();

            if (streetSegments.All(x => x.St_Code != fromStreetDetails.StreetCode))
                return BadRequest("The 'from street' does not cross the 'on street'.");
            try
            {
                Get_CrossStreetsFromStCode_new_Result startingSegment =
                    streetSegments.FirstOrDefault(x => x.NodeOrder == fromNodeNumber);

                if (startingSegment == null)
                    return Ok("No additional segments");

                IEnumerable<Get_CrossStreetsFromStCode_new_Result> result =
                    streetSegments.Where(x => x.NodeOrder > startingSegment.NodeOrder);
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
            StreetsViewModels.LocationDetails locationDetals = GetStreetCode(location, trimLeadingNumbers);

            if (locationDetals.SegmentId == null)
                return Ok();

            int result = _db.sp_Get_HightrafficArea(locationDetals.SegmentId);

            return Ok(result);
        }

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/locations/GetFromNodeIds")]
        public async Task<IHttpActionResult> GetFromNodeIds(int? stCode, int? fromNodeOrder, int? toNodeOrder)
        {
            ObjectResult<get_OnStreetElementsBetweenOrderedPair_Result> result =
                _db.get_OnStreetElementsBetweenOrderedPair(stCode, fromNodeOrder, toNodeOrder);

            return Ok(result);
        }

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [AllowAnonymous]
        [Route("api/locations/GetStreetSegmentLine")]
        public async Task<IHttpActionResult> GetStreetSegmentLine(string street)
        {
            var numSts = new[]
            {
                "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"
            };

            var firstThreeChar = new string(street.ToLower().Take(3).ToArray());

            bool sn = numSts.Any(x => x.StartsWith(firstThreeChar));

            string streetNumberString = !sn ? new String(street.TakeWhile(Char.IsDigit).ToArray()) : "";

            string streetName = street.TrimStart(new[] {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'});


            streetName = streetName.Trim(new[] {' '});


            // 1234 Market St
            if (streetNumberString.Length > 0)
            {
                int streetNumber = Convert.ToInt32(streetNumberString);

                bool isEven = streetNumber%2 == 0;

                if (isEven)
                    return Ok(
                        _db.tblStreets.Where(
                            x => (
                                x.StreetName.StartsWith(streetName)
                                ||
                                x.StreetNameShort.StartsWith(streetName)
                                ||
                                x.StreetNameShort.StartsWith(street)
                                ||
                                x.StreetNameShort.StartsWith(streetName)
                                )
                                 &&
                                 x.R_F_ADD <= streetNumber
                                 &&
                                 x.R_T_ADD >= streetNumber
                            )
                            .GroupBy(x => new {x.StreetName, StreetCode = x.ST_CODE, SegmentId = x.SEG_ID, FromAddress = x.R_F_ADD, ToAddress = x.R_T_ADD})
                            .Select(x => new
                            {
                                StreetName = streetNumber + " " + x.Key.StreetName,
                                x.Key.StreetCode,
                                x.Key.SegmentId,
                                FromAddress = x.Key.FromAddress + " " + x.Key.StreetName + ", Philadelphia, PA",
                                ToAddress = x.Key.ToAddress + " " + x.Key.StreetName + ", Philadelphia, PA"
                            })
                            .OrderBy(x => x.StreetName)
                            .Take(10)
                            .ToList()
                        );
                return Ok(_db.tblStreets.Where(
                    x => (
                        x.StreetName.StartsWith(streetName)
                        ||
                        x.StreetNameShort.StartsWith(streetName)
                        ||
                        x.StreetNameShort.StartsWith(street)
                        ||
                        x.StreetNameShort.StartsWith(streetName)
                        )
                         &&
                         x.L_F_ADD <= streetNumber
                         &&
                         x.L_T_ADD >= streetNumber
                    )
                    .GroupBy(x => new { x.StreetName, StreetCode = x.ST_CODE, SegmentId = x.SEG_ID, FromAddress = x.L_F_ADD, ToAddress = x.L_T_ADD })
                    .Select(x => new
                    {
                        StreetName = streetNumber + " " + x.Key.StreetName,
                        x.Key.StreetCode,
                        x.Key.SegmentId,
                        FromAddress = x.Key.FromAddress + " " + x.Key.StreetName + ", Philadelphia, PA",
                        ToAddress = x.Key.ToAddress + " " + x.Key.StreetName + ", Philadelphia, PA"
                    })
                    .OrderBy(x => x.StreetName)
                    .Take(10)
                    .ToList()
                    );
            }
            return Ok();

        }

        private StreetsViewModels.LocationDetails GetStreetCode(string location, bool trimLeadingNumbers = true)
        {
            if (trimLeadingNumbers)
                location = location.TrimStart(new[] {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'});

            location = location.Trim(new[] {' '});
            StreetsViewModels.LocationDetails result =
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