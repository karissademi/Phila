using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Phila.Web.Api.Streets.Helpers
{
    static class EmailHelper
    {
        public static bool SendEmail(MailMessage mailMessage)
        {
            bool mailSent = false;
            //ToDo: save this info securely
            const string host = "";
            const string user = "";
            const string password = "";
            //var mailClient = new SmtpClient("relay.phila.gov");

            var mailClient = new SmtpClient(host, 587)
            {
                Credentials = new NetworkCredential(user, password),
                EnableSsl = true
            };

            try
            {
                mailClient.Send(mailMessage);
                mailSent = true;
            }
            catch (Exception exception)
            {
                //ToDo: LogError(exception);
            }

            return mailSent;
        }
    }
}
