var pkgcloud = require('pkgcloud');
var Writable = require('stream').Writable;
var path = require('path');
var mime = require('mime');

module.exports = function RackspaceStore(options) {
  options = options || {};

  var adapter = {};

  adapter.rm = function(fd, done){
    //se elimina fd y continua.
    done(new Error('TODO'));
  };

  adapter.ls = function(dirpath, done){
    //regresa arreglo de archivos y continua.
    done(null,[]);

  };

  adapter.read = function(fd, done){
    //lee el archivo o crea un stream
    done(new Error('TODO'));
  };

  adapter.receive = pkgCloudReceiver;

  return adapter;

  function pkgCloudReceiver(opts){

    var receiver__ = Writable({
      objectMode: true
    });

    var client = getClientStorage(options);

    receiver__.once('error', function(err){
      //console.log('once err',err);
    });

    receiver__._write = function(__newFile, encoding, next){
      options.tmpdir = options.tmpdir || path.resolve(process.cwd(), '.tmp/pkgcloud-temp');

      var file = {
        container: options.container,
        remote: __newFile.fd,
        contentType: mime.lookup(__newFile.fd),
      };

      writeStream = client.upload(file);

      writeStream.on('error', function(err){
        receiver__.emit('error', err);
      });

      writeStream.on('progress', function(data){
        //console.log('progress', data);
      });

      writeStream.on('success', function(data){
        next();
      });

      __newFile.pipe(writeStream);

    };

    return receiver__;

  };

};

function findOrCreateContainer(options, done){
  done = done || function(){};

  var containerName = options.container || 'pkgcloud';
  var client = getClientStorage(options);

  client.getContainer(containerName, function(err,cont){
    if(err && err.statusCode == 404){//lo creamos
      containerExist = true;
      client.createContainer(containerName, done);
    }else{
      containerExist = true;
      done(null,cont);
    }
  });

}

function getClientStorage(options){
  var cl = {
    provider: options.provider || 'rackspace',
    username: options.username,
    apiKey: options.apiKey,
    region: options.region,
    useInternal: options.useInternal || false
  };
  return pkgcloud.storage.createClient(cl);
}
