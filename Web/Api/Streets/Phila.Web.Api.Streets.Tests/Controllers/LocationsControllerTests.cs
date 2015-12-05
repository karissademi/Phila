using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http.Results;
using System.Web.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Phila.Web.Api.Streets.Controllers;
using Phila.Web.Api.Streets.Models;

namespace Phila.Web.Api.Streets.Tests.Controllers
{
    [TestClass]
    public class LocationsControllerTests
    {
        [TestMethod]
        public void GetOnStreets()
        {
            // Arrange
            var controller = new LocationsController();
            const string onStreet = "1234 market st";

            // Act
            var actionResult = controller.GetOnStreets(onStreet);
            var contentResult = actionResult as OkNegotiatedContentResult<List<StreetsViewModels.Street>>;

            // Assert
            Assert.IsNotNull(actionResult);
            Assert.IsNotNull(contentResult.Content);
            Assert.AreEqual(1, contentResult.Content.Count());
        }
    }
}