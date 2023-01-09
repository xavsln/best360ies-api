// Sample data to initialize the mongoDB

// Sample panos
// Added via the mongosh CLI
var pano1 = {
  panoUrl: "Test",
  googlePanoId: "Test",
  latitude: 1,
  longitude: 2,
  heading: 3,
  pitch: 4,
  country: "Test",
  areaName: "Test",
  addedBy: "Test",
  staticImgUrl: "Test",
};

db.panos.insertOne(pano1);

// Sample users
// Users can be added directly using Postman
// {
//   "username": "UserTest1",
//   "password": "12345",
//   "email": "user1@fromlocal.com",
//   "birthday": "1970-01-01",
//   "role": "user"
// }
