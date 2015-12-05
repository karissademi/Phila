using System.Web;
using System.Web.Mvc;

namespace Phila.Web.Api.Streets
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
