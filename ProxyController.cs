using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Text;
using System.IO;
using System;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Web.Http;
using WebApplicationCOP.Models;
using System.Net;

public class ProxyController : Controller
{
    private static readonly HttpClient httpClient = new HttpClient();
    private const string AzureApiUrl = "https://hospitality-aiservice-apimanagement.azure-api.net/Acteol/deployments/Acteol/chat/completions";
    private const string CustomerApiUrl = "https://testonebrand.atreemo.com/api/Customer/FindCustomerDetails";
    private const string AzureApiKey = "a4d0a552cd394456a1902254f610b35b";

    [System.Web.Mvc.HttpPostAttribute]
    public async Task<ActionResult> ForwardRequest()
    {
        try
        {
            // Read the request body
            string requestBody = await new StreamReader(Request.InputStream).ReadToEndAsync();

            // Forward the request to the Azure API
            var request = new HttpRequestMessage(HttpMethod.Post, AzureApiUrl);
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");
            request.Headers.Add("Ocp-Apim-Subscription-Key", AzureApiKey);

            var response = await httpClient.SendAsync(request);

            // Read the response body
            string responseBody = await response.Content.ReadAsStringAsync();

            // Log the response (optional)
            Console.WriteLine("Response from Azure: " + responseBody);

            // Return the response
            return Content(responseBody, "application/json");
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine("Error in ForwardRequest: " + ex.Message);
            return new HttpStatusCodeResult(500, "Internal Server Error");
        }
    }

    [System.Web.Mvc.HttpPostAttribute]
    public async Task<ActionResult> FindCustomerDetails([FromBody] FindCustomerDetailsRequest searchRequest)
    {
        try
        {
            // Log the incoming request
            Console.WriteLine("Incoming request: " + JsonConvert.SerializeObject(searchRequest));

            var request = new HttpRequestMessage(HttpMethod.Post, "https://testonebrand.atreemo.com/api/Customer/FindCustomerDetails");
            var jsonContent = JsonConvert.SerializeObject(searchRequest);
            request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            // Ensure the Bearer token is added correctly
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "DywtH-cRW6SZdoRvNqsOPEaa2iat_7HEpg5B4BEC6i09x7giE56akcYb0e_xaMoZFxApfk9Cp6HikTQsctasDSsEck9LygLNiGB2wZSvj6LdDYf_pWLJdcyRIHvNK4fw-PU9maGtmAXyMzKV4cUbInFZamSsLydTyjmGQI0S86QeUzF9OR-igmlIswy2oNgmarsnaRtcxX-rN8_9merStYezLIlXJDaeVAjsABoBTv3kJhdVm9fYJyXGfybp0AqUWOQlTiu7gMM2ngiM648YLvBZp43-2seizXVnPDdOjxPCf99P2N5h0_TJyVhRHmVrJIbVmIxI3kHl-W1D1gPtznsAfd3wsv131LVffmpJLoC2bhBS");

            var response = await httpClient.SendAsync(request);
            string responseBody = await response.Content.ReadAsStringAsync();

            // Log the response
            Console.WriteLine("Response from Customer API: " + responseBody);

            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                Console.WriteLine("Unauthorized: Invalid Bearer token");
                return new HttpStatusCodeResult(401, "Unauthorized: Invalid Bearer token");
            }

            return Content(responseBody, "application/json");
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine("Error in FindCustomerDetails: " + ex.Message);
            return new HttpStatusCodeResult(500, "Internal Server Error");
        }
    }
}

