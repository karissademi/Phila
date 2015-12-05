using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Hosting;
using MigraDoc.DocumentObjectModel;
using MigraDoc.Rendering;
using PdfSharp.Pdf;
using Phila.Data.EntityModels.Streets;

namespace Phila.Web.Api.Streets.Models
{
    public class PdfMediaTypeFormatter : MediaTypeFormatter
    {
        private static readonly Type SupportedType = typeof (tblPermit);

        public PdfMediaTypeFormatter()
        {
            SupportedMediaTypes.Add(new MediaTypeHeaderValue("application/pdf"));
            MediaTypeMappings.Add(new UriPathExtensionMapping("pdf", "application/pdf"));
        }

        public override Task WriteToStreamAsync(Type type, object value, Stream writeStream, HttpContent content,
            TransportContext transportContext)
        {
            var taskSource = new TaskCompletionSource<object>();
            try
            {
                var permit = (tblPermit) value;

                PdfDocument doc = PdfGenerator.CreatePdf(permit);
                var ms = new MemoryStream();

                doc.Save(ms, false);

                byte[] bytes = ms.ToArray();
                writeStream.Write(bytes, 0, bytes.Length);
                taskSource.SetResult(null);
            }
            catch (Exception e)
            {
                taskSource.SetException(e);
            }
            return taskSource.Task;
        }

        public override bool CanReadType(Type type)
        {
            return SupportedType == type;
        }

        public override bool CanWriteType(Type type)
        {
            return SupportedType == type;
        }
    }


    public static class PdfGenerator
    {
        public static PdfDocument CreatePdf(tblPermit permit)
        {
            var document = new MigraDoc.DocumentObjectModel.Document();
            Section sec = document.Sections.AddSection();

            //var img = System.Drawing.Image.FromFile(HostingEnvironment.ApplicationPhysicalPath + @"Content\Images\240px-Seal.png");

            sec.AddImage(HostingEnvironment.ApplicationPhysicalPath + @"Content\Images\240px-Seal.png");

            sec.AddParagraph("PERMIT ID:" + permit.Permit_Number);
            sec.AddParagraph(string.Format("COMPANY: {0}", permit.Company_Name ?? "BLANK"));
            sec.AddParagraph(string.Format("EFFECTIVE DATE: {0}", permit.EffectiveDate));
            sec.AddParagraph(string.Format("EXPIRATION DATE: {0}", permit.ExpirationDate));
            sec.AddParagraph(string.Format("STATUS: {0}", permit.tblDecision.DecisionName ?? ""));
            sec.AddParagraph("");
            sec.AddParagraph("LOCATION");
            
            if (permit.Address1 != null)
                sec.AddParagraph(permit.Address1);
            
            if (permit.Address2 != null)
                sec.AddParagraph(permit.Address2);
            
            sec.AddParagraph(string.Format("{0}, {1} {2}", permit.City ?? "UNKNOWN CITY", permit.State ?? "UNKNOWN STATE", permit.PostalCode ?? "UNKNOWN ZIP CODE"));
            sec.AddParagraph("");
            sec.AddParagraph("CONTACT INFO");
            sec.AddParagraph(string.Format("{0} {1}", permit.Contact_First_Name ?? "", permit.Contact_Last_Name ?? ""));
            sec.AddParagraph(string.Format("Phone number: {0}", permit.Phone ?? "BLANK"));
            sec.AddParagraph("");
            sec.AddParagraph("PURPOSE");
            sec.AddParagraph(string.Format("{0}", permit.Purpose ?? "BLANK"));

            return RenderDocument(document);
        }

        private static PdfDocument RenderDocument(MigraDoc.DocumentObjectModel.Document document)
        {
            var rend = new PdfDocumentRenderer {Document = document};
            rend.RenderDocument();
            return rend.PdfDocument;
        }

    }
}