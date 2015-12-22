using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Phila.Data.EntityModels.Streets;

namespace Phila.Logic.Streets.Location
{
    public class StreetCode
    {
        public LocationDetails GetStreetCode(string location, bool trimLeadingNumbers = true)
        {
            var trimChars = new[] {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};

            if (trimLeadingNumbers)
            {
                location = location.TrimStart(trimChars);
            }

            location = location.Trim(new[] {' '});

            using (var db = new SCBPPSEntities())
            {
                return
                    db.tblStreets.Where(x => x.STNAME == location || x.STNAME == location)
                        .Select(
                            x => new LocationDetails {StreetCode = x.ST_CODE, SegmentId = x.SEG_ID})
                        .FirstOrDefault();

            }
        }
    }
}
