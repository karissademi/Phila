using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Phila.Data.EntityModels.Streets;

namespace Phila.Web.Api.Streets.Helpers
{
    internal class SecurityToken
    {

        private const string _alg = "HmacSHA256";
        private const string _salt = "5NuLeN2XPDLGZ2TDPTYD"; // Generated at https://www.random.org/strings

        public static string GenerateToken(string username, string password, string ip, string userAgent, long ticks)
        {
            string hash = string.Join(":", new string[] {username, ip, userAgent, ticks.ToString()});
            string hashLeft = "";
            string hashRight = "";

            using (HMAC hmac = HMACSHA256.Create(_alg))
            {
                hmac.Key = Encoding.UTF8.GetBytes(GetHashedPassword(password));
                hmac.ComputeHash(Encoding.UTF8.GetBytes(hash));

                hashLeft = Convert.ToBase64String(hmac.Hash);
                hashRight = string.Join(":", new string[] {username, ticks.ToString()});
            }

            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes(string.Join(":", hashLeft, hashRight)));
            token = token.Replace("=", "").Replace("?", "");
            return token;
        }

        private static string GetHashedPassword(string password)
        {
            string key = string.Join(":", new string[] {password, _salt});

            using (HMAC hmac = HMACSHA256.Create(_alg))
            {
                // Hash the key.
                hmac.Key = Encoding.UTF8.GetBytes(_salt);
                hmac.ComputeHash(Encoding.UTF8.GetBytes(key));

                return Convert.ToBase64String(hmac.Hash);
            }
        }

        private const int _expirationMinutes = 1440; // one day

        public bool IsTokenValid(string token)
        {
            bool result = false;

            try
            {
                using(var db = new SCBPPSEntities())
                {
                    var userToken = db.UserTokens.FirstOrDefault(x => x.Token == token);

                    if (userToken != null)
                    {
                        // Ensure the timestamp is valid.
                        bool expired = Math.Abs((DateTime.UtcNow - userToken.UpdatedUtc).TotalMinutes) > _expirationMinutes;
                        if (!expired)
                        {
                            result = true;

                            userToken.UpdatedUtc = DateTime.UtcNow;

                            db.Entry(userToken).State = EntityState.Modified;

                            try
                            {
                                db.SaveChanges();
                            }
                            catch (DbUpdateConcurrencyException)
                            {
                            }
                        }
                    }
                }
            }
            catch (Exception exception)
            {
                throw exception;
            }

            return result;
        }

        public static bool IsTokenValid(string token, string ip, string userAgent)
        {
            bool result = false;

            try
            {
                // Base64 decode the string, obtaining the token:username:timeStamp.
                string key = Encoding.UTF8.GetString(Convert.FromBase64String(token));

                // Split the parts.
                string[] parts = key.Split(new char[] {':'});
                if (parts.Length == 3)
                {
                    // Get the hash message, username, and timestamp.
                    string hash = parts[0];
                    string username = parts[1];
                    long ticks = long.Parse(parts[2]);
                    DateTime timeStamp = new DateTime(ticks);

                    // Ensure the timestamp is valid.
                    bool expired = Math.Abs((DateTime.UtcNow - timeStamp).TotalMinutes) > _expirationMinutes;
                    if (!expired)
                    {
                        //
                        // Lookup the user's account from the db.
                        //
                        if (username == "john")
                        {
                            string password = "password";


                            // Hash the message with the key to generate a token.
                            string computedToken = GenerateToken(username, password, ip, userAgent, ticks);

                            // Compare the computed token with the one supplied and ensure they match.
                            result = (token == computedToken);
                        }
                    }
                }
            }
            catch
            {
            }

            return result;
        }

    }
}
