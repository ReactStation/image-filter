import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
  app.get("/filteredimage", async (req: express.Request, res: express.Response) => {
    //    1. validate the image_url query
    let url:string = req.query.image_url;
    if (!url) res.status(400).send("Missing image url!");

    //    2. call filterImageFromURL(image_url) to filter the image
    let image: string;
    try {
      image = await filterImageFromURL(url);
    } catch (error) {
      if (error) res.status(500).send("Failed to read image file!");
    }

    //    3. send the resulting file in the response
    //    4. deletes any files on the server on finish of the response
    res.status(200).sendFile(image, err => {
      if (err) res.status(500).send("Failed to send file!");
      else deleteLocalFiles([...image]);
    });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Start the Server
  app.listen( port, () => {
    console.log( `server running http://localhost:${ port }` );
    console.log( `press CTRL+C to stop server` );
  } );
})();