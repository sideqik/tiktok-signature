const express = require('express');
const app = express();

const Signer = require("./index");
const signer = new Signer();
signer.init();

app.get('/sign', async (req, res) => {

  const url = req.query.url;
  if(!url) {
    console.error("Received request with no url parameter");
    res.status(422).send("url parameter required");

  } else {

    console.log(`Generating signature for ${url}`);
    try {
      const sign = await signer.sign(url);
      const navigator = await signer.navigator();

      const output = {
        status: "ok",
        data: {
          signature: sign.signature,
          verify_fp: sign.verify_fp,
          signed_url: sign.signed_url,
          navigator: navigator,
          "x-tt-params": sign.x_tt_params,
        },
      };

      console.log(`Generated signature ${sign.signature} for ${url}`);
      res.json(output);

    } catch(e) {
      console.error(e);
      res.status(500).send(`Error generating signature for ${url}`);
    }
  }
});

const TIKTOK_SIGN_PORT = process.env.TIKTOK_SIGN_PORT || 8081;
app.listen(TIKTOK_SIGN_PORT, () => {
  console.log(`Server listening on port ${TIKTOK_SIGN_PORT}...`);
});

process.on('exit', function() {
  console.log('Shutting down signer...');
  signer.close();
});
