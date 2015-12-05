using Microsoft.Azure;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.StorageClient;
using Phila.Web.Api.Streets.Controllers;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;


namespace Phila.Web.Api.Streets.Helpers
{

    internal static class BlobHelper
    {
        public static CloudBlobContainer GetWebApiContainer()
        {
            // Retrieve storage account from connection-string
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(
                CloudConfigurationManager.GetSetting("CloudStorageConnectionString"));

            // Create the blob client 
            CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

            // Retrieve a reference to a container 
            // Container name must use lower case
            CloudBlobContainer container = blobClient.GetContainerReference("webapicontainer");

            // Create the container if it doesn't already exist
            container.CreateIfNotExist();

            // Enable public access to blob
            var permissions = container.GetPermissions();
            if (permissions.PublicAccess == BlobContainerPublicAccessType.Off)
            {
                permissions.PublicAccess = BlobContainerPublicAccessType.Blob;
                container.SetPermissions(permissions);
            }

            return container;
        }
    }

    public class AzureBlobStorageMultipartProvider : MultipartFileStreamProvider
    {
        private CloudBlobContainer _container;
        public AzureBlobStorageMultipartProvider(CloudBlobContainer container)
            : base(Path.GetTempPath())
        {
            _container = container;
            Files = new List<FileDetails>();
        }

        public List<FileDetails> Files { get; set; }

        public override Task ExecutePostProcessingAsync()
        {
            // Upload the files to azure blob storage and remove them from local disk
            foreach (var fileData in this.FileData)
            {
                string fileName = Path.GetFileName(fileData.Headers.ContentDisposition.FileName.Trim('"'));

                // Retrieve reference to a blob
                CloudBlob blob = _container.GetBlobReference(fileName);
                blob.Properties.ContentType = fileData.Headers.ContentType.MediaType;
                blob.UploadFile(fileData.LocalFileName);
                File.Delete(fileData.LocalFileName);
                Files.Add(new FileDetails
                {
                    ContentType = blob.Properties.ContentType,
                    Name = blob.Name,
                    Size = blob.Properties.Length,
                    Location = blob.Uri.AbsoluteUri
                });
            }

            return base.ExecutePostProcessingAsync();
        }
    }

}