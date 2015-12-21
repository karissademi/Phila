using System;
using System.Linq;
using Phila.Data.EntityModels.Streets;

namespace Phila.Logic.Streets.Locations
{
    public class GetLocationStreetCodeAndSegId
    {
        public LocationDetails GetStCodeAndSegId(string location)
        {
            var numSts = new[] {"1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"};
            var trimNums = new[] {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};

            var firstThreeChar = new string(location.ToLower().Take(3).ToArray());

            var sn = numSts.Any(x => x.StartsWith(firstThreeChar));

            var streetNumberString = !sn ? new string(location.TakeWhile(char.IsDigit).ToArray()) : string.Empty;

            var streetName = location.TrimStart(trimNums);

            streetName = streetName.Trim(' ');

            var result = new LocationDetails();

            if (streetNumberString.Length <= 0) return result;

            var streetNumber = Convert.ToInt32(streetNumberString);

            var isEven = streetNumber%2 == 0;

            result = isEven
                ? GetLocationDetailsForEvenAddress(location, streetName, streetNumber)
                : GetLocationDetailsForOddAddress(location, streetName, streetNumber);

            return result;
        }

        private static LocationDetails GetLocationDetailsForEvenAddress(string location, string streetName,
            int streetNumber)
        {
            using (var db = new SCBPPSEntities())
            {
                return db.tblStreets.Where(
                    x =>
                        (x.STNAME.StartsWith(streetName) || x.ST_NAME.StartsWith(streetName) ||
                         x.ST_NAME.StartsWith(location) ||
                         x.ST_NAME.StartsWith(streetName)) && x.R_F_ADD <= streetNumber && x.R_T_ADD >= streetNumber)
                    .Select(x => new LocationDetails
                    {
                        StreetCode = x.ST_CODE,
                        SegmentId = x.SEG_ID
                    }).FirstOrDefault();
            }
        }

        private static LocationDetails GetLocationDetailsForOddAddress(string location, string streetName,
            int streetNumber)
        {
            using (var db = new SCBPPSEntities())
            {
                return db.tblStreets.Where(x => (x.STNAME.StartsWith(streetName)
                                                 || x.ST_NAME.StartsWith(streetName) || x.ST_NAME.StartsWith(location)
                                                 || x.ST_NAME.StartsWith(streetName)) && x.L_F_ADD <= streetNumber &&
                                                x.L_T_ADD >= streetNumber
                    ).Select(x => new LocationDetails
                    {
                        StreetCode = x.ST_CODE,
                        SegmentId = x.SEG_ID
                    }).FirstOrDefault();
            }
        }
    }
}