const express = require('express');
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json({ type: 'application/json' }));


app.get('/', (req, res)=> {
    res.end();
  });

  // Create the express router object for Photos
var photoRouter = express.Router();
// A GET to the root of a resource returns a list of that resource
photoRouter.get("/", (req, res)=> { });
// A POST to the root of a resource should create a new object
photoRouter.post("/", (req, res)=> {
    let sql = 'INSERT INTO photo (description, filepath, album_id) VALUES ($1,$2,$3) RETURNING id';
    // Retrieve the data to insert from the POST body
    let data = [
      req.body.description,
      req.body.filepath,
      req.body.album_id
    ];
    postgres.client.query(sql, data, (err, result)=> {
      if (err) {
        //  logging internal errors
        console.error(err);
        res.statusCode = 500;
        return res.json({
          errors: ['Failed to create photo']
        });
      }
      var newPhotoId = result.rows[0].id;
      var sql = 'SELECT * FROM photo WHERE id = $1';
      postgres.client.query(sql, [ newPhotoId ], (err, result)=> {
        if (err) {
          // We shield our clients from internal errors, but log them
          console.error(err);
          res.statusCode = 500;
          return res.json({
            errors: ['Could not retrieve photo after create']
          });
        }
        // The request created a new resource object
        res.statusCode = 201;
        // The result of CREATE should be the same as GET
        res.json(result.rows[0]);
    });
  });});
// We specify a param in our path for the GET of a specific object
photoRouter.get("/:id", lookupPhoto, (req, res)=> { });
// Similar to the GET on an object, to update it we can PATCH
photoRouter.patch("/:id", lookupPhoto, (req, res)=> { });
// Delete a specific object
photoRouter.delete("/:id", lookupPhoto, (req, res)=> { });
// Attach the routers for their respective paths
app.use("/photo", photoRouter);




 function lookupPhoto(req, res, next) {
    // We access the ID param on the request object
    let photoId = req.params.id;
    // Build an SQL query to select the resource object by ID
    let sql = 'SELECT * FROM photo WHERE id = ?';
    postgres.client.query(sql, [ photoId ], function(err, results) {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        return res.json({ errors: ['Could not retrieve photo'] });
      }
      // No results returned mean the object is not found
      if (results.rows.length === 0) {
        // We are able to set the HTTP status code on the res object
        res.statusCode = 404;
        return res.json({ errors: ['Photo not found'] });
      }
      // By attaching a Photo property to the request
      // Its data is now made available in our handler function
      req.photo = results.rows[0];
      next();
    });
  }

module.exports = app;
