Add the following lines of code after updating the emdx files:


public SCBPPSEntities()
            : base("name=SCBPPSEntities")
        {

			// Add these two lines
            this.Configuration.LazyLoadingEnabled = false;
            this.Configuration.ProxyCreationEnabled = false;
        }