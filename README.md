# [<img title="skipper-s3 - S3 adapter for Skipper" src="http://i.imgur.com/P6gptnI.png" width="200px" alt="skipper emblem - face of a ship's captain"/>](https://github.com/urielaero/skipper-pkgcloud) pkgCloud Blob Adapter


pkgCloud adapter for receiving [upstreams](https://github.com/balderdashy/skipper#what-are-upstreams). Particularly useful for handling streaming multipart file uploads from the [Skipper](https://github.com/balderdashy/skipper) body parser.


## Installation

```
$ npm install skipper-pkgcloud --save
```

Also make sure you have skipper itself [installed as your body parser](http://beta.sailsjs.org/#/documentation/concepts/Middleware?q=adding-or-overriding-http-middleware).  This is the default configuration in [Sails](https://github.com/balderdashy/sails) as of v0.10.


## Usage

```javascript
req.file('avatar')
.upload({
  adapter: require('skipper-pkgcloud'),
  provider: 'rackspace',
  username: 'usernameprovider',
  apiKey: 'apikey provider',
  container: 'my_container_name',
  region:'DFW'
}, function whenDone(err, uploadedFiles) {
  if (err) return res.negotiate(err);
  else return res.ok({
    files: uploadedFiles,
    textParams: req.params.all()
  });
});
```

## See pkgCloud
[pkgcloud](https://github.com/pkgcloud/pkgcloud)


## Contribute

To run the tests:

```sh
git clone git@github.com:urielaero/skipper-pkgcloud.git
cd skipper-pkgcloud
npm install
CLOUDPROVIDER=defualtRackspace CLOUDUSERNAME=your_username CLOUDAPIKEY=your_cloudapikey, CLOUDREGION=your_cloudregion, CLOUDCONTAINER=your_container_name
```

Please don't check in your provider credentials :)

## License

**[MIT](./LICENSE)**
