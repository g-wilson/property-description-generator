# ChatGPT Property Description Generator

This repo contains a toy API service which generates UK property listing descriptions.

It achieves this by allowing the user to specify structured data they have about the property (which would likely be sourced from UI input or by integrating against other systems), combining this with structured data about the location of the property via the Google Maps API, and then using the OpenAI ChatGPT API to synthesize it all into natural language.

As well as this core function, the service also includes the following features which you might want in a real API service like this:
- Authentication via Firebase auth
- Authentication via API key
- Ability to generate API keys for an account (and list/revoke them)
- A very very basic way to validate that users have agreed some terms and conditions
- A way to view the history of the descriptions generated
- An API designed to allow serving different kinds of AI completions in future

### Tech stack / dependencies

- OpenAI for ChatGPT (obviously)
- MongoDB for storing everything (and because they have a free tier)
- Postcodes.IO for converting UK postcodes into Lat/Long pairs
- Google Maps Places API for finding nearby locations
- Firebase Auth for authenticating human users via SMS
- It's designed to be run on Google Coud Run and you will see a few references to it, like logging, IAM authentication, and some production-specific environment references, but it's not a requirement. In theory you can run the container anywhere that accepts HTTP traffic.
- There is also an authentication provider for Google Cloud IAM identities, which would be used for example if it was deployed as a Cloud Run service and we wanted it to authenticate incoming Pub/Sub messages.


## License

&copy; All rights reserved.
