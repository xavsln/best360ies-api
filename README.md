# Welcome !

This is a **RESTful API** where users can interact with a collection of **Panoranic photos (ie. 360 photos)**.

For each 360 photo included in the database, data returned by the API include:

- Id
- Url
- Google panoID
- Latitude
- Longitude
- Heading
- Pitch
- Country
- Area name (ie. either region, city etc...)
- UserId of the user who added the 360 photo to the collection
- Url of the Static version of the 360 photo

<br>

# 1. App description

This App main features include:

- Returns **a list of all 360 photos** to the user
- Returns **data** (id, url, panoID (ie. Google Pano ID), latitude, longitude, heading, pitch, country, areaName, addedBy, staticImgUrl) about a **single 360 photo** by 360 photo Id to the user
- Returns **a list of 360 photos** located in a specific **location** (by area name) to the user
- Returns **a list of 360 photos** added by a specific **user** (by userId) to the user
- Allows new users to **register**
- Allows users to **update** their user info (username, password, email, date of birth)
- Allows users to add **a 360 photo** to global collection of 360 photos
- Allows users to add **a 360 photo** to their list of favorites
- Allows users to remove **a 360 photo** from their list of favorites
- Allows existing users to **deregister**

<br>

# 2. Link to the online documentation page

https://best360ies-api.herokuapp.com/documentation.html

<br>

# 3. Example of Front-end App developed using this API

<br>
