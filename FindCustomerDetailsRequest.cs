using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplicationCOP.Models
{
    public class FindCustomerDetailsRequest
    {
        public SearchFilters SearchFilters { get; set; }
        public ResponseFilters ResponseFilters { get; set; }
        public int BrandID { get; set; }
    }

    public class SearchFilters
    {
        public string Email { get; set; }
        // Add other properties as needed
    }

    public class ResponseFilters
    {
        public bool LoyaltyDetails { get; set; }
        public bool MarketingOptin { get; set; }
        public bool Preferences { get; set; }
    }
}